import {
  encodeBase64,
  decodeBase64,
} from "https://deno.land/std/encoding/base64.ts";

/** Class representing a BufferResult. */
class BufferResult {
  /**
   * @member {Uint8Array}
   */
  buffer: Uint8Array;
  /**
   * @member {boolean}
   */
  isError = false;

  /**
   * Create a Buffer Result.
   * @param {Uint8Array} buffer - the payload.
   * @param {boolean} isError - is the result an error
   */
  constructor(buffer: Uint8Array, isError: boolean) {
    this.buffer = buffer;
    this.isError = isError;
  }

  /**
   * Convert buffer to string.
   * @return {string} The string result.
   */
  toString() {
    return new TextDecoder("utf8").decode(this.buffer);
  }

  /**
   * Convert buffer to Json object.
   * @return {object} The JSON object result.
   */
  toJson() {
    return JSON.parse(new TextDecoder("utf8").decode(this.buffer));
  }
}

function callHandlerWithString(
  instance: WebAssembly.Instance,
  payload: string
) {
  const bytes = new TextEncoder("utf8").encode(payload);
  return callHandlerWithBytes(instance, bytes);
}
function callHandlerWithJson(instance: WebAssembly.Instance, payload: any) {
  const bytes = new TextEncoder("utf8").encode(JSON.stringify(payload));
  return callHandlerWithBytes(instance, bytes);
}

const MASK = 2n ** 32n - 1n;

function callHandlerWithBytes(
  instance: WebAssembly.Instance,
  bytes: Uint8Array
) {
  // Copy the contents of bytes payload into the module's memory
  const ptr = instance.exports.alloc(bytes.length);
  const mem = new Uint8Array(
    instance.exports.memory["buffer"],
    ptr,
    bytes.length
  );
  mem.set(new Uint8Array(bytes));

  // Call `callHandler` and get a kind of pair of value
  const pointerAndSize = instance.exports.callHandler(ptr, bytes.length);

  const memory = instance.exports.memory;
  const completeBufferFromMemory = new Uint8Array(memory.buffer);

  // Extract the values of the pair
  const ptrPosition = Number(pointerAndSize >> BigInt(32));
  const stringSize = Number(pointerAndSize & MASK);

  let extractedBuffer = completeBufferFromMemory.slice(
    ptrPosition,
    ptrPosition + stringSize
  );

  return new BufferResult(
    extractedBuffer.slice(1, stringSize),
    extractedBuffer[0] === 69
  );
}

export async function handleRequest(
  instance: WebAssembly.Instance,
  req: Request
): Promise<Response> {
  const resp = callHandlerWithJson(instance, {
    url: req.url,
    method: req.method,
    body: encodeBase64(await req.text()),
    headers: Object.fromEntries(req.headers.entries()),
  });
  if (resp.isError) {
    return new Response(resp.toString(), { status: 500 });
  }
  const responseObj = resp.toJson();
  return new Response(decodeBase64(responseObj.body), {
    status: responseObj.status,
    headers: responseObj.headers,
  });
}
