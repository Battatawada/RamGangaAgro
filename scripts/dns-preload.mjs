import dns from "node:dns";
import { Resolver } from "node:dns/promises";

const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

async function resolve4(hostname) {
  try {
    return (await resolver.resolve4(hostname))[0];
  } catch {
    const cname = await resolver.resolveCname(hostname);
    return (await resolver.resolve4(cname[0]))[0];
  }
}

function lookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  resolve4(hostname).then(
    (address) => callback(null, address, 4),
    (error) => callback(error),
  );
}

dns.lookup = lookup;
dns.promises.lookup = async (hostname) => ({
  address: await resolve4(hostname),
  family: 4,
});
