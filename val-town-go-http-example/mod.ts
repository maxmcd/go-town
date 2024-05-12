import Context from "https://deno.land/std@0.93.0/wasi/snapshot_preview1.ts";

import { handleRequest } from "https://deno.land/x/gotown/mod.ts";

const context = new Context({ args: [], env: {} });
let instance: WebAssembly.Instance;
// const binary = await Deno.readFile("main.wasm");

export const init = async (wasmBytes: Uint8Array) => {
  const module = await WebAssembly.compile(wasmBytes);
  instance = await WebAssembly.instantiate(module, {
    wasi_snapshot_preview1: context.exports,
  });
  context.start(instance);
};

export default function (req: Request): Promise<Response> {
  return handleRequest(instance, req);
}
