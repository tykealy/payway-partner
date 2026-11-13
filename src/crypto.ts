import { constants, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt } from "node:crypto";

function normalizeKey(key: string): string {
  return key.trim().replace(/\\n/g, "\n");
}

export function encryptWithRSA(publicKey: string, data: string): string {
  const key = createPublicKey(normalizeKey(publicKey));
  const bits = key.asymmetricKeyDetails?.modulusLength;
  if (key.asymmetricKeyType !== "rsa" || !bits) throw new Error("A valid RSA public key is required");
  const chunkSize = Math.ceil(bits / 8) - 11;
  const input = Buffer.from(data, "utf8");
  const chunks: Buffer[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(publicEncrypt({ key, padding: constants.RSA_PKCS1_PADDING }, input.subarray(i, i + chunkSize)));
  }
  return Buffer.concat(chunks).toString("base64");
}

export function decryptWithRSA(privateKey: string, data: string): string {
  const key = createPrivateKey(normalizeKey(privateKey));
  const bits = key.asymmetricKeyDetails?.modulusLength;
  if (key.asymmetricKeyType !== "rsa" || !bits) throw new Error("A valid RSA private key is required");
  const input = Buffer.from(data, "base64");
  const chunkSize = Math.ceil(bits / 8);
  if (!input.length || input.length % chunkSize !== 0) throw new Error("Invalid RSA encrypted data length");
  const chunks: Buffer[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(privateDecrypt({ key, padding: constants.RSA_PKCS1_PADDING }, input.subarray(i, i + chunkSize)));
  }
  return Buffer.concat(chunks).toString("utf8");
}
