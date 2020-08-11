import { ServerRequest } from "../deps.ts";
import { HttpErrors } from "../error-handling/errors.ts";
import { HTTP_METHODS } from "../common/rest.standards.ts";
import { RouteGroup, Routes } from "../interfaces/router-interface.ts";
import { RouteValidator } from "./route-validator.ts";

export class Router {
  private routes: Routes;
  private validationFailed = false;

  constructor(routeGroups: RouteGroup[]) {
    this.routes = routeGroups.map((routeGroup) =>
      routeGroup.routes.map((route) => {
        const middlewares = [];
        if (routeGroup.middlewares) {
          middlewares.push(...routeGroup.middlewares);
        }
        if (route.middlewares) {
          middlewares.push(...route.middlewares);
        }
        const extendedRoute = {
          ...route,
          url: this.prepareUrlPrefix(routeGroup.urlPrefix) +
            this.checkRouteUrl(route.url),
          middlewares,
        };
        return extendedRoute;
      })
    ).flat();
  }

  public async route(req: ServerRequest) {
    const routeValidator = new RouteValidator(req);
    const routeAndParams = await this.routeValidation(routeValidator);
    if (routeAndParams) {
      const { route, params } = routeAndParams;
      if (route) {
        if (route.middlewares && route.middlewares.length > 0) {
          for await (const middleware of route.middlewares) {
            await middleware(req);
          }
        }
        await route.callback(req, params);
      }
    }
  }

  private async routeValidation(routeValidator: RouteValidator) {
    await this.validateUrl(routeValidator);
    await this.validateMethod(routeValidator);
    if (!this.validationFailed) {
      let params = new Map<string, string>();
      const route = this.routes.find((r) => {
        const urlParameterObject = routeValidator.matchParams(r);
        if (urlParameterObject.matches) {
          params = urlParameterObject.params;
          return r;
        }
      });
      return { route, params };
    }
    this.validationFailed = false;
  }

  private async validateUrl(routeValidator: RouteValidator) {
    let validRoute = this.routes.some((r) =>
      routeValidator.naturallyMatches(r)
    );
    if (!validRoute) {
      validRoute = this.routes.some((r) => {
        const urlParameterObject = routeValidator.matchParams(r);
        return urlParameterObject.matches;
      });
    } else if (!validRoute) {
      this.validationFailed = true;
      await routeValidator.request.respond(
        { status: 404, body: HttpErrors.get(404) },
      );
    }
  }

  private async validateMethod(routeValidator: RouteValidator): Promise<void> {
    const validMethod = HTTP_METHODS.find((m) =>
      m === routeValidator.request.method
    );
    if (!validMethod) {
      this.validationFailed = true;
      await routeValidator.request.respond(
        { status: 405, body: HttpErrors.get(405) },
      );
    }
  }

  private prepareUrlPrefix(urlPrefix: string): string {
    return `/${urlPrefix.split("/").filter((val) => val !== "").join("/")}`;
  }

  private checkRouteUrl(routeUrl: string): string {
    if (!routeUrl.startsWith("/") || !routeUrl.endsWith("/")) {
      throw new Error("Path of the route has to start and end with a '/'!");
    }
    return routeUrl;
  }
}
