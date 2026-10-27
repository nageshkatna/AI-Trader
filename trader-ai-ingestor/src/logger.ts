export const logger = {
  info: (msg: string, extra?: unknown) =>
    console.log(JSON.stringify({ level: "info", msg, extra })),
  error: (msg: string, extra?: unknown) =>
    console.error(JSON.stringify({ level: "error", msg, extra })),
};
