import { RouteGroup } from "./router-interface.ts";

export interface ApplicationConfig {
  port: number;
  routeGroups: RouteGroup[];
  hostname?: string;
}
