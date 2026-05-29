import crypto from "crypto";

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("Thiếu ENCRYPTION_KEY");
  if (/^[a-fA-F0-9]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  const normalized = Buffer.from(raw);
  if (normalized.length === 32) return normalized;
  const base64 = Buffer.from(raw, "base64");
  if (base64.length === 32) return base64;
  throw new Error("ENCRYPTION_KEY phải là 32 bytes, base64 32 bytes hoặc hex 64 ký tự");
}

export function encryptText(plainText?: string | null): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptText(encryptedText?: string | null): string {
  if (!encryptedText) return "";
  const [ivRaw, authTagRaw, dataRaw] = encryptedText.split(".");
  if (!ivRaw || !authTagRaw || !dataRaw) return "";
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(authTagRaw, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataRaw, "base64")), decipher.final()]).toString("utf8");
}
