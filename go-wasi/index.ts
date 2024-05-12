import Context from "./snapshot_preview1.ts";

const context = new Context({
  args: Deno.args,
  env: {},
});

const binary = await Deno.readFile("main.wasm");
const module = await WebAssembly.compile(binary);

const prev_sock_send = context.exports.sock_send;
const prev_sock_recv = context.exports.sock_recv;
const prev_sock_shutdown = context.exports.sock_shutdown;

const ERRNO_NOSYS = 52;

const sock_recv = (
  _fd: number,
  _riDataOffset: number,
  _riDataLength: number,
  _riFlags: number,
  _roDataLengthOffset: number,
  _roFlagsOffset: number
): number => {
  console.log(sock_recv);
  return prev_sock_recv(
    _fd,
    _riDataOffset,
    _riDataLength,
    _riFlags,
    _roDataLengthOffset,
    _roFlagsOffset
  );
  return ERRNO_NOSYS;
};

const sock_send = (
  _fd: number,
  _siDataOffset: number,
  _siDataLength: number,
  _siFlags: number,
  _soDataLengthOffset: number
): number => {
  console.log(sock_send);
  return prev_sock_send(
    _fd,
    _siDataOffset,
    _siDataLength,
    _siFlags,
    _soDataLengthOffset
  );
  return ERRNO_NOSYS;
};

const sock_shutdown = (_fd: number, _how: number): number => {
  console.log(sock_shutdown);
  return prev_sock_shutdown(_fd, _how);
  return ERRNO_NOSYS;
};

context.exports.sock_recv = sock_recv;
context.exports.sock_send = sock_send;
context.exports.sock_shutdown = sock_shutdown;

const instance = await WebAssembly.instantiate(module, {
  wasi_snapshot_preview1: context.exports,
});

context.start(instance);
