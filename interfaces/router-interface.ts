import { HttpMethods } from "../common/rest.standards.ts";
import { ServerRequest } from "../deps.ts";

export type Parameters = {
  url: Map<string, string>;
  path: Map<string, string>;
};

export type RouteCallback = (
  req: ServerRequest,
  jsonBody: any,
  params: Parameters,
) => unknown;
export type Middleware = RouteCallback;

export type Route = {
  method: HttpMethods | string;
  path: string;
  callback: RouteCallback;
  middlewares?: Middleware[];
};

export type Routes = Route[];

export type RouteGroup = {
  routes: Routes;
  urlPrefix: string;
  middlewares?: Middleware[];
};

export interface ValueIndex {
  value: string;
  index: number;
}

export interface ValueIndexDynamic extends ValueIndex {
  dynamic: boolean;
}

export type PathStringArrayAndUrlParams = {
  pathStringArray: ValueIndex[];
  urlParams?: URLSearchParams;
};

export interface RouteParameterObject {
  params: Parameters;
  route: Route;
}

export interface RouteParameterJsonBodyObject {
  params: Parameters;
  route: Route;
  jsonBody: any;
}

export interface RouteParameterJsonBodyMatchesObject
  extends RouteParameterObject {
  matches: boolean;
  jsonBody: any;
}
