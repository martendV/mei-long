import { listenAndServe, ServerRequest } from "./deps.ts";
import { Router } from "./router/router.ts";
import { ApplicationConfig } from "./interfaces/application-interface.ts";

export class Application {
  private port: number;
  private hostname?: string;
  private router: Router;

  constructor(config: ApplicationConfig) {
    this.port = config.port;
    this.hostname = config.hostname;
    this.router = new Router(config.routeGroups);
  }

  public async start() {
    this.hostname
      ? listenAndServe(
        { port: this.port, hostname: this.hostname },
        (req: ServerRequest) => this.router.route(req),
      )
      : listenAndServe(
        { port: this.port },
        (req: ServerRequest) => this.router.route(req),
      );
  }
}
