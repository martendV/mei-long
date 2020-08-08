import { HttpMethods } from '../common/rest.standards.ts';
import { ServerRequest } from 'https://deno.land/std@0.63.0/http/server.ts';

export type Route = {
    method: HttpMethods | string;
    url: string;
    callback: RouteCallback;
    middlewares?: MiddlewareCallback[];
}

export type RouteCallback = (req: ServerRequest) => any;
export type MiddlewareCallback = (req: ServerRequest) => any;