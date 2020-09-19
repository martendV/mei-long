import {
  Route,
  PathStringArrayAndUrlParams,
  Parameters,
  ValueIndex,
  ValueIndexDynamic,
  RouteParameterJsonBodyMatchesObject,
} from "../interfaces/router-interface.ts";
import { ServerRequest } from "../deps.ts";
import { HttpMethods } from "../common/rest.standards.ts";

export class RouteValidator {
  public request: ServerRequest;

  constructor(request: ServerRequest) {
    this.request = request;
    this.request.url = decodeURI(this.request.url);
  }

  public naturallyMatches(route: Route): boolean {
    return this.request.url === route.path &&
      this.request.method === route.method;
  }

  public async matchParams(
    route: Route,
  ): Promise<RouteParameterJsonBodyMatchesObject> {
    if (this.request.method === route.method) {
      const requestUrlAndParams = this.prepareIncomingRouteUrl(
        this.request.url,
      );
      const routePathStringArray = this.prepareRoutePathStringArray(route.path);
      if (
        requestUrlAndParams.pathStringArray.length !==
          routePathStringArray.length
      ) {
        return {
          matches: false,
          params: {
            path: new Map<string, string>(),
            url: new Map<string, string>(),
          },
          route,
          jsonBody: undefined,
        };
      }
      const params = this.matchRequestAndRoute(
        requestUrlAndParams,
        routePathStringArray,
      );
      const jsonBody = await this.parseJsonBody(route);
      return params ? { matches: true, params, route, jsonBody } : {
        matches: false,
        params: {
          path: new Map<string, string>(),
          url: new Map<string, string>(),
        },
        route,
        jsonBody,
      };
    }
    return {
      matches: false,
      params: {
        path: new Map<string, string>(),
        url: new Map<string, string>(),
      },
      route,
      jsonBody: undefined,
    };
  }

  private matchRequestAndRoute(
    requestUrlAndParams: PathStringArrayAndUrlParams,
    routePathStringArray: ValueIndexDynamic[],
  ): Parameters | undefined {
    const pathParams = new Map<string, string>();
    const urlParams = new Map<string, string>();
    let match = true;
    for (let i = 0; i < routePathStringArray.length; i++) {
      if (
        !routePathStringArray[i].dynamic &&
        routePathStringArray[i].value !==
          requestUrlAndParams.pathStringArray[i].value &&
        routePathStringArray[i].index ===
          requestUrlAndParams.pathStringArray[i].index
      ) {
        match = false;
      }
      if (
        routePathStringArray[i].dynamic &&
        routePathStringArray[i].index ===
          requestUrlAndParams.pathStringArray[i].index
      ) {
        pathParams.set(
          routePathStringArray[i].value.replace(":", ""),
          requestUrlAndParams.pathStringArray[i].value,
        );
      }
    }
    if (match) {
      if (requestUrlAndParams.urlParams) {
        requestUrlAndParams.urlParams.forEach((k, v) => urlParams.set(k, v));
      }
      return { url: urlParams, path: pathParams };
    } else {
      return undefined;
    }
  }

  private prepareIncomingRouteUrl(
    requestRouteUrl: string,
  ): PathStringArrayAndUrlParams {
    const pathStringArray: ValueIndex[] = [];
    if (requestRouteUrl.includes("?")) {
      const splitRoute = requestRouteUrl.split("?");
      const pathString = splitRoute[0].endsWith("/")
        ? splitRoute[0]
        : splitRoute[0] + "/";
      pathString.split("/").forEach((value, index) => {
        if (value !== "") {
          pathStringArray.push({ value, index });
        }
      });
      const urlParams = new URLSearchParams(splitRoute[1]);
      return { pathStringArray, urlParams };
    } else {
      requestRouteUrl.split("/").forEach((value, index) => {
        if (value !== "") {
          pathStringArray.push({ value, index });
        }
      });
      return { pathStringArray };
    }
  }

  private prepareRoutePathStringArray(routePath: string): ValueIndexDynamic[] {
    const verifiedRoutePath = routePath.endsWith("/")
      ? routePath
      : routePath + "/";
    const routePathStringArray: ValueIndexDynamic[] = [];
    verifiedRoutePath.split("/").forEach((value, index) => {
      if (value !== "") {
        routePathStringArray.push(
          { dynamic: value.includes(":"), value, index },
        );
      }
    });
    return routePathStringArray;
  }

  private async parseJsonBody(route: Route): Promise<any> {
    if (
      [HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH].some(
        (method) => method === route.method.toUpperCase(),
      )
    ) {
      try {
        return JSON.parse(
          new TextDecoder().decode(await Deno.readAll(this.request.body)),
        );
      } catch (error) {
        return error.message;
      }
    }
  }
}
