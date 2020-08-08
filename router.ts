import { Route } from './interfaces/router-interface.ts';
import { ServerRequest } from "https://deno.land/std@0.63.0/http/server.ts";
import { HttpErrors } from './error-handling/errors.ts';
import { HTTP_METHODS } from './common/rest.standards.ts';

export class Router {
    private routes: Route[];
    private urlExtension: string;
    private validationFailed = false;

    constructor(routes: Route[], urlExtension?: string) {
        this.routes = routes;
        this.urlExtension = urlExtension || "";
    }

    public async route(req: ServerRequest) {
        const route = await this.routeValidation(req);
        //TODO: apply middlewares
        if (route) {
            await route.callback(req);
        }
    }

    private async routeValidation(req: ServerRequest) {
        await this.validateUrl(req);
        await this.validateMethod(req);
        await this.validateContentType(req);
        if (!this.validationFailed) {
            const route = this.routes.find(r => r.url === req.url.replace(this.urlExtension, ""));
            return route!;
        }
        this.validationFailed = false;
    }

    private async validateUrl(req: ServerRequest) {
        const validRoute = this.routes.find(route => this.urlExtension + route.url === req.url && route.method === req.method);
        if (!validRoute) {
            this.validationFailed = true;
            await req.respond({ status: 404, body: HttpErrors.get(404) });
        }
    }

    private async validateMethod(req: ServerRequest): Promise<void> {
        const validMethod = HTTP_METHODS.find(m => m === req.method);
        if (!validMethod) {
            this.validationFailed = true;
            await req.respond({ status: 405, body: HttpErrors.get(405) })
        }
    }

    private validateContentType(req: ServerRequest) {
        const validContentType = req.headers.get("content-type");
        if (!validContentType) {
            this.validationFailed = true;
            req.respond({ status: 412, body: HttpErrors.get(412) });
        }
        //TODO: validate defined content-type for the route
    }
}