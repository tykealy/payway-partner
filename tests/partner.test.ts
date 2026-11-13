import { createHmac, generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptWithRSA, encryptWithRSA, formatRequestTime, PayWayAPIError, PayWayPartnerClient } from "../src/index.js";

const keys = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});
const merchantKeys = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});
const config = { base_url: "https://example.com/", partner_id: "partner", partner_key: "secret", rsa_public_key: keys.publicKey, referer: "https://partner.example" };
const client = new PayWayPartnerClient(config);
function mockSuccess() {
  const mock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ status: { code: "00", message: "Success" }, data: "encrypted" }), { status: 200 }));
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("partner SDK", () => {
  it("encrypts and decrypts multi-block UTF-8 data using the key size", () => {
    const value = "ខ្មែរ🙂".repeat(100);
    expect(decryptWithRSA(keys.privateKey, encryptWithRSA(keys.publicKey, value))).toBe(value);
    expect(decryptWithRSA(merchantKeys.privateKey, encryptWithRSA(merchantKeys.publicKey, value))).toBe(value);
    expect(() => decryptWithRSA(keys.privateKey, "abcd")).toThrow("length");
  });

  it("sends registration with the correct signed encrypted data and reference", async () => {
    vi.useFakeTimers().setSystemTime(new Date("2024-02-03T04:05:06Z"));
    const fetchMock = mockSuccess();
    const params = { register_ref: "REQ-1", currency: "USD" as const, pushback_url: "https://example.com/cb", redirect_url: "https://example.com/done" };
    expect((await client.registerMerchant(params)).status.code).toBe("00");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const fields = JSON.parse(init.body as string);
    expect(url).toBe("https://example.com/api/merchant-portal/online-self-activation/new-merchant");
    expect(init.headers).toEqual({ "Content-Type": "application/json", referer: config.referer });
    expect(fields.reference_id).toBe(params.register_ref);
    expect(JSON.parse(decryptWithRSA(keys.privateKey, fields.request_data))).toEqual(params);
    expect(fields.request_time).toBe("20240203040506");
    expect(fields.hash).toBe(createHmac("sha256", config.partner_key).update(config.partner_id + fields.request_data + fields.request_time).digest("hex"));
  });

  it("sends reference and merchant-key inquiries with their respective proofs", async () => {
    const fetchMock = mockSuccess();
    expect((await client.getMerchantByReference("REQ-2")).data).toBe("encrypted");
    const [refUrl, refInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(refUrl).toContain("/get-mc-credential-info");
    expect(JSON.parse(decryptWithRSA(keys.privateKey, JSON.parse(refInit.body as string).request_data))).toEqual({ register_ref: "REQ-2" });
    await client.getMerchantByPublicKey({ merchant_key: "EC0002", currency: "KHR", public_key: "merchant-secret", rsa_public_key: merchantKeys.publicKey });
    const [url, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    const fields = JSON.parse(init.body as string);
    expect(url).toContain("/get-mc-info");
    const data = JSON.parse(decryptWithRSA(keys.privateKey, fields.request_data));
    const proof = config.partner_id + "EC0002" + fields.request_time;
    expect(data.public_key_hash_encrypt).toBe(createHmac("sha512", "merchant-secret").update(proof).digest("hex"));
    expect(decryptWithRSA(merchantKeys.privateKey, data.rsa_public_key_hash_encrypt)).toBe(proof);
    expect(data).not.toHaveProperty("public_key");
  });

  it("supports base64 signatures and parses encrypted merchant responses", async () => {
    const fetchMock = mockSuccess();
    await new PayWayPartnerClient({ ...config, hash_encoding: "base64" }).getMerchantByReference("ref");
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    const fields = JSON.parse(init.body as string);
    expect(fields.hash).toBe(createHmac("sha256", config.partner_key).update(config.partner_id + fields.request_data + fields.request_time).digest("base64"));
    const info = { outlet_name: "Test", aba_account_khr: "", aba_account_usd: "1", available_payment_methods: {}, enabled_payment_methods: {}, pending_payment_methods: {} };
    expect(client.decryptInquiryData(encryptWithRSA(keys.publicKey, JSON.stringify(info)), keys.privateKey)).toEqual(info);
    expect(formatRequestTime(new Date("2024-01-01T00:00:00Z"))).toBe("20240101000000");
  });

  it("executes JSON requests and retains HTTP error details", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ status: { code: "00", message: "Success" }, data: "encrypted" }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ error: "bad" }), { status: 400, statusText: "Bad Request" }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await client.getMerchantByReference("ref")).data).toBe("encrypted");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/get-mc-credential-info"), expect.objectContaining({ method: "POST", headers: { "Content-Type": "application/json", referer: config.referer } }));
    await expect(client.getMerchantByReference("ref")).rejects.toMatchObject({ status: 400, body: { error: "bad" } } satisfies Partial<PayWayAPIError>);
  });
});
