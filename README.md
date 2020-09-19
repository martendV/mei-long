<p align="center"><img src="https://image.flaticon.com/icons/svg/1494/1494163.svg" height="128" width="128"></p>
<p align="center"><img src="https://img.shields.io/github/v/release/martendV/mei-long?include_prereleases&style=for-the-badge">
<img src="https://img.shields.io/github/license/martendV/mei-long?style=for-the-badge"></p>


# mei-long
REST Framework for Deno Standard HTTP Library
## Introduction
mei-long is a wrapper around the Deno Standard HTTP Library. The goal of this framework is to create a small overhead while providing convenience for the developer by making it as easy as possible to create a REST-conform HTTP/HTTPS server. This is a open-source project and MIT licensed. Any serious participation is welcome.
## Getting started
To create your first server you can simply run the following code:
```ts
import {
  Application,
  Routes,
  RouteGroup,
  HttpMethods,
} from "https://deno.land/x/mei_long/mei-long.ts";

const apiV1Routes: Routes = [{
  method: HttpMethods.GET,
  path: "/",
  callback: (req) => {
    req.respond({ body: "HelloWorld" });
  },
}];

const apiV1: RouteGroup = {
  urlPrefix: "api/v1",
  routes: apiV1Routes,
};

const app = new Application(
  {
    port: 3003,
    routeGroups: [apiV1],
  },
);
app.start();
console.log("Server started");
```

## Usage
As already told, the main idea was simplicity and keep the overhead as small as possible. Like the Deno Standard HTTP Library.

### Application

To start the server:
```ts
const app = new Application(
  {
    port: 3003,
    routeGroups: [...],
  },
);
app.start();
```

should do the job.
Where you define the following config:

```ts
interface ApplicationConfig {
  port: number;
  routeGroups: RouteGroup[];
  hostname?: string;
}
```
### RouteGroups and Routes
But what are `RouteGroups`? The idea of a `RouteGroup` is that you can group separate routes that belong together. For example because of same functionality, API version, etc. . Especially if you are working on an updated version (V2) of your API, you can just create a new group, define the `urlPrefix` property (e.g. `api/v2`) and add it to your application.

```ts
type RouteGroup = {
  routes: Routes;
  urlPrefix: string;
  middlewares?: Middleware[];
};
```
Each `RouteGroup` has a different set of `Routes`. Routes are defined as an Array of `Route` objects. With Routes being an array you can easily define multiple arrays of Route objects (e.g. sorted by main, login, user, etc.) and then spread them to one big array (`[...mainRoutes, ...loginRoutes, ...userRoutes]`). This allows you to better manage your routes.

A `Route` is simple what you would expect in any REST environment.
- It got a `method`, that must be a valid HTTP method (You can also just use a string here, but using the `HttpMethods` enum is recommended)
- An `path` (e.g. "/customer/123/")
- A `callback` function that will simple pass through the `req` ("ServerRequest") object from the Deno Standard HTTP Library, while providing `params` ("Map<string,string>")
- And `middlewares` which are also just passthrough functions like the `callback`

```ts
type Route = {
  method: HttpMethods | string;
  path: string;
  callback: RouteCallback;
  middlewares?: Middleware[];
};
```

### RouteCallback

The `RouteCallback` is the function where your code (database operations, static data servings, etc.) will be written. You have access to the `ServerRequest` object of the Deno Standard HTTP Library. A little goody is, that you also have access to `params` which is an object with `path` and `url` as maps of `Map<string,string>`. All path and url parameters are stored there.

For example:

- The defined route `/user/:id/` will with a call of `/user/123` will give you `123` as value of the key `id`

```ts
...
    callback: (req, params) => {
        req.respond({ body: `The user id is: ${params.path.get("id")}` });
    }
  ...
```

- The defined route `/user/` receives an url parameter `id` like the following `http://localhost:3003/user?id=123` or `http://localhost:3003/user/?id=123`

```ts
...
    callback: (req, params) => {
        req.respond({ body: `The user id is: ${params.url.get("id")}` });
    }
  ...
```

### JsonBody

Since this is a JSON-based http router you will find a `jsonBody` object in your callback parameters, when you work with a `POST`, `PUT` or `PATCH` (more to follow).

```ts
...
    callback: (req, jsonBody, _params) => {
        req.respond({ body: `The cool json prop is: ${jsonBody.myCoolJsonProp}` });
    }
  ...
```

### Middlewares

As you might have noticed by now, you can define middlewares for `Routes` and/or for `RouteGroups`. This allows you to have for example a authentication for a group of routes while giving you the option to write code that should be executed before the `RouteCallback` of a single route.

Middlewares have acces to the `ServerRequest` object.

```ts
{
    ...
    myCoolMiddleware: (req) => {
        doSomethingCool();
        req.headers.get("Authorization");
        ...
    }
}
```

## License
This project is created with a MIT license.

## Acknowledgements
Icons made by [smalllikeart](https://www.flaticon.com/authors/smalllikeart) from [Flaticon](https://www.flaticon.com/)
