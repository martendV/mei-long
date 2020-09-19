import { ServerRequest } from "../deps.ts";
import {
  RouteGroup,
  Routes,
  Route,
  RouteParameterJsonBodyMatchesObject,
  RouteParameterJsonBodyObject,
} from "../interfaces/router-interface.ts";
import { RouteValidator } from "./route-validator.ts";

export class Router {
  private routes: Routes;

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
        const extendedRoute: Route = {
          ...route,
          path: this.prepareUrlPrefix(routeGroup.urlPrefix) +
            this.checkRoutePath(route.path),
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
      const { route, params, jsonBody } = routeAndParams;
      if (route) {
        if (route.middlewares && route.middlewares.length > 0) {
          for await (const middleware of route.middlewares) {
            await middleware(req, jsonBody, params);
          }
        }
        await route.callback(req, jsonBody, params);
      }
    }
  }

  private async routeValidation(
    routeValidator: RouteValidator,
  ): Promise<RouteParameterJsonBodyObject | undefined> {
    let routeParameterObject: RouteParameterJsonBodyMatchesObject | undefined;
    for (const route of this.routes) {
      const urlParameterObject = await routeValidator.matchParams(route);
      if (urlParameterObject.matches) {
        routeParameterObject = urlParameterObject;
      }
    }
    if (routeParameterObject) {
      return {
        route: routeParameterObject.route,
        params: routeParameterObject.params,
        jsonBody: routeParameterObject.jsonBody,
      };
    } else {
      return undefined;
    }
  }

  private prepareUrlPrefix(urlPrefix: string): string {
    return `/${urlPrefix.split("/").filter((val) => val !== "").join("/")}`;
  }

  private checkRoutePath(routePath: string): string {
    if (!routePath.startsWith("/")) {
      routePath = "/" + routePath;
    }
    if (!routePath.endsWith("/")) {
      routePath = routePath + "/";
    }
    return routePath;
  }
}
