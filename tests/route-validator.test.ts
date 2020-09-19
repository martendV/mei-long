import { assertEquals, assert } from "./../deps.ts";
import { RouteValidator } from "../router/route-validator.ts";
import { HttpMethods } from "./../common/rest.standards.ts";

// Happy Paths

Deno.test({
  name: "creates new route validator",
  fn(): void {
    const routeValidator = new RouteValidator({ url: "test" } as any);
    assertEquals("test", routeValidator.request.url);
  },
});

Deno.test({
  name: "decodes url",
  fn(): void {
    const encodedUrl = encodeURI("/Müller/Müller/Müller");
    const routeValidator = new RouteValidator(
      { url: encodedUrl } as any,
    );
    assertEquals("/Müller/Müller/Müller", routeValidator.request.url);
  },
});

Deno.test({
  name: "route naturally matches",
  fn(): void {
    const encodedUrl = encodeURI("/Müller/Müller/Müller");
    const routeValidator = new RouteValidator(
      { url: encodedUrl, method: "POST" } as any,
    );
    assert(
      routeValidator.naturallyMatches(
        {
          method: HttpMethods.POST,
          path: "/Müller/Müller/Müller",
          callback: function () {},
        },
      ),
    );
  },
});
