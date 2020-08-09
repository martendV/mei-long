import { HttpMethods } from "../common/rest.standards.ts";
import { ServerRequest } from "../deps.ts";

export type RouteCallback = (
  req: ServerRequest,
  params: Map<string, string>,
) => unknown;
export type Middleware = (req: ServerRequest) => unknown;

export type Route = {
  method: HttpMethods | string;
  url: string;
  callback: RouteCallback;
  middlewares?: Middleware[];
};

export type Routes = Route[];

export type RouteGroup = {
  routes: Routes;
  urlPrefix: string;
  middlewares?: Middleware[];
};

export type UrlParameterObject = {
  url: string;
  params: Map<string, string>;
};
