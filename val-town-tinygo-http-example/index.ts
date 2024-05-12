import handleRequest, { init } from "./mod.ts";

init(await Deno.readFile("main.wasm"));

Deno.serve({ port: 8080 }, (req) => {
  return handleRequest(req);
});
