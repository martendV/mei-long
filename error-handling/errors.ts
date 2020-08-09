export const HttpErrors = new Map<number, string>(
  [
    [404, "Not found."],
    [405, "Method not allowed."],
    [412, "Precondition failed."],
  ],
);
