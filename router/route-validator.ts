import { Route, UrlParameterObject } from "../interfaces/router-interface.ts";
import { ServerRequest } from "../deps.ts";

export class RouteValidator {
  public request: ServerRequest;

  constructor(request: ServerRequest) {
    this.request = request;
  }

  public naturallyMatches(route: Route): boolean {
    return this.request.url === route.url &&
      this.request.method === route.method;
  }

  public matchParams(
    route: Route,
  ): { matches: boolean; params: Map<string, string> } {
    const requestRouteArray = this.request.url.split("/");
    const routeArray = route.url.split("/");
    if (requestRouteArray.length !== routeArray.length) {
      return { matches: false, params: new Map<string, string>() };
    }
    const { url: parameterizedUrl, params } = this.getUrlParameterObject(
      requestRouteArray,
      routeArray,
    );
    if (
      parameterizedUrl === this.request.url &&
      this.request.method === route.method
    ) {
      return { matches: true, params };
    }
    return { matches: false, params: new Map<string, string>() };
  }

  private getUrlParameterObject(
    requestRouteArray: string[],
    routeArray: string[],
  ): UrlParameterObject {
    const params = new Map<string, string>();
    const url = routeArray.map((val, index) => {
      if (val.includes(":")) {
        const parameter = requestRouteArray[index];
        if (index !== 1) {
          params.set(
            `${requestRouteArray[index - 1]}_${val.replace(":", "")}`,
            requestRouteArray[index],
          );
        } else {
          params.set(
            `${val.replace(":", "")}`,
            requestRouteArray[index],
          );
        }
        return parameter;
      } else {
        return val;
      }
    }).join("/");
    return { url, params };
  }
}
