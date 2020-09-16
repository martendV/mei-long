import {
  Route,
  ParameterObject,
  UrlParamSplitRoute,
  Parameters,
} from "../interfaces/router-interface.ts";
import { ServerRequest } from "../deps.ts";

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

  public matchParams(
    route: Route,
  ): { matches: boolean; params: Parameters } {
    const requestUrl = this.prepareIncomingRouteUrl(this.request.url);
    const requestRouteArray = requestUrl.route.split("/");
    const requestUrlParamsRouteArray = this.prepareUrlParamsRouteArray(
      requestUrl.urlParamsRoute,
    );
    const routeArray = route.path.split("/");
    if (requestRouteArray.length !== routeArray.length) {
      return {
        matches: false,
        params: {
          path: new Map<string, string>(),
          url: new Map<string, string>(),
        },
      };
    }
    const { url: parameterizedUrl, params } = this.getParameterObject(
      requestRouteArray,
      routeArray,
      requestUrlParamsRouteArray,
    );
    if (
      parameterizedUrl === requestUrl.route &&
      this.request.method === route.method
    ) {
      return { matches: true, params };
    }
    return {
      matches: false,
      params: {
        path: new Map<string, string>(),
        url: new Map<string, string>(),
      },
    };
  }

  private getParameterObject(
    requestRouteArray: string[],
    routeArray: string[],
    urlParamsRouteArray: string[],
  ): ParameterObject {
    const pathParams = new Map<string, string>();
    const urlParams = new Map<string, string>();
    const url = routeArray.map((val, index) => {
      if (val.includes(":")) {
        const parameter = requestRouteArray[index];
        pathParams.set(
          `${val.replace(":", "")}`,
          requestRouteArray[index],
        );
        return parameter;
      } else {
        return val;
      }
    }).join("/");
    if (urlParamsRouteArray.length > 0) {
      urlParamsRouteArray.forEach((param) => {
        const splitParamString = param.split("=");
        if (splitParamString.length === 2) {
          urlParams.set(splitParamString[0], splitParamString[1]);
        }
      });
    }
    return { url, params: { url: urlParams, path: pathParams } };
  }

  private prepareIncomingRouteUrl(requestRouteUrl: string): UrlParamSplitRoute {
    if (requestRouteUrl.includes("?")) {
      const splitRoute = requestRouteUrl.split("?");
      const route = splitRoute[0].endsWith("/")
        ? splitRoute[0]
        : splitRoute[0] + "/";
      const urlParamsRoute = splitRoute[1];
      return { route, urlParamsRoute };
    } else {
      const route = requestRouteUrl.endsWith("/")
        ? requestRouteUrl
        : requestRouteUrl + "/";
      return { route };
    }
  }

  private prepareUrlParamsRouteArray(urlParamsRoute?: string): string[] {
    if (urlParamsRoute) {
      const params = urlParamsRoute ? urlParamsRoute.split("&") : [];
      return params;
    } else {
      return [];
    }
  }
}
