import { go as g } from "./wasm_exec.js";
const _ = g;

const go = new window.Go();
const buf = await Deno.readFileSync("./main.wasm");
const inst = await WebAssembly.instantiate(buf, go.importObject);
globalThis.gotown = {
  registerHTTPHandler: (cb: () => void): void => {
    cb();
  },
};

await go.run(inst.instance);
