import Context from "https://deno.land/std@0.93.0/wasi/snapshot_preview1.ts";

const context = new Context({ args: [], env: {} });
const binary = await Deno.readFile("main.wasm");
const module = await WebAssembly.compile(binary);
const instance = await WebAssembly.instantiate(module, {
  wasi_snapshot_preview1: context.exports,
});
context.start(instance);
