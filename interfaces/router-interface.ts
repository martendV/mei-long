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

export type ParameterObject = {
  url: string;
  params: Parameters;
};

export type UrlParamSplitRoute = {
  route: string;
  urlParamsRoute?: string;
};
