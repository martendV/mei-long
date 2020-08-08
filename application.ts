import { Route } from './interfaces/router-interface.ts';
import { serve } from 'https://deno.land/std@0.63.0/http/server.ts';
import { Router } from './router.ts';

export class Application {

    private port: number;
    private hostname?: string;
    private urlExtension?: string;
    private routes: Route[];
    private router: Router;

    constructor(port: number, routes: Route[], hostname?: string, urlExtension?: string) {
        this.port = port;
        this.hostname = hostname;
        this.urlExtension = urlExtension;
        this.routes = routes;
        this.router = new Router(this.routes, this.urlExtension);
    }

    public async start() {
        const s = serve({ port: this.port, hostname: this.hostname });
        for await (const req of s) {
            this.router.route(req);
        }
    }
}