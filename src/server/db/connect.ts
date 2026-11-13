import { lookup, Resolver } from "node:dns/promises";
import net from "node:net";

/**
 * The machine resolver sometimes cannot see Neon. Fall back to a public
 * resolver, then connect to that address. TLS still uses the original
 * hostname, so the certificate check does not change.
 */
export async function resolveHost(hostname: string): Promise<string> {
  if (net.isIP(hostname)) return hostname;

  try {
    return (await lookup(hostname, { family: 4 })).address;
  } catch {
    const resolver = new Resolver();
    resolver.setServers(["1.1.1.1", "8.8.8.8"]);
    try {
      return (await resolver.resolve4(hostname))[0];
    } catch {
      const cname = await resolver.resolveCname(hostname);
      return (await resolver.resolve4(cname[0]))[0];
    }
  }
}

type SocketResult = net.Socket;

/** postgres.js socket hook. The library still performs the TLS upgrade. */
export function connectResolved(
  _options: unknown,
  host: string,
  port: number,
): Promise<SocketResult> {
  return new Promise((resolve, reject) => {
    resolveHost(host).then((address) => {
      const socket = net.connect({ port, host: address });
      const fail = (error: Error) => {
        socket.off("connect", ready);
        reject(error);
      };
      const ready = () => {
        socket.off("error", fail);
        socket.setNoDelay(true);
        resolve(socket);
      };
      socket.once("error", fail);
      socket.once("connect", ready);
    }, reject);
  });
}
