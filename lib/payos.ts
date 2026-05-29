import "server-only";
import { PayOS } from "@payos/node";

export const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "payos-client-id-required",
  apiKey: process.env.PAYOS_API_KEY || "payos-api-key-required",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "payos-checksum-key-required"
});
