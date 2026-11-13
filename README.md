# payway-partner

TypeScript SDK for ABA PayWay Partner merchant registration and inquiries. Requires Node.js 18 or newer.

## Setup

```bash
npm install payway-partner
```

```ts
import { PayWayPartnerClient } from "payway-partner";

const client = new PayWayPartnerClient({
  base_url: process.env.PAYWAY_BASE_URL!,
  partner_id: process.env.PAYWAY_PARTNER_ID!,
  partner_key: process.env.PAYWAY_PARTNER_KEY!,
  rsa_public_key: process.env.PAYWAY_RSA_PUBLIC_KEY!,
  referer: "https://your-whitelisted-domain.example",
});
```

The public key above is the ABA RSA public key used to encrypt requests. Keep the partner key and private keys on your server. The referer must match the domain whitelisted by ABA.

Requests use hex-encoded HMAC-SHA256, matching the PHP examples and sample hashes in the Partner API documentation. Set `hash_encoding: "base64"` in the configuration if ABA requires the Base64 encoding described elsewhere in those docs.

## Register a merchant

```ts
const result = await client.registerMerchant({
  register_ref: "merchant-001",
  pushback_url: "https://your-domain.example/payway/pushback",
  redirect_url: "https://your-domain.example/registration-complete",
  currency: "USD",
  type: 0,
  merchant_type: 1,
});

if (result.status.code === "00") console.log(result.url);
```

Use a unique `register_ref` for each registration. For native apps, `redirect_url` can instead be an object containing `ios_scheme` and `android_scheme`.

## Inquire by registration reference

```ts
const response = await client.getMerchantByReference("merchant-001");
if (response.status.code === "00" && response.data) {
  const details = client.decryptInquiryData<Record<string, unknown>>(
    response.data,
    process.env.PARTNER_RSA_PRIVATE_KEY!,
  );
  console.log(details);
}
```

## Inquire by merchant public key

```ts
const response = await client.getMerchantByPublicKey({
  merchant_key: "EC0002",
  currency: "USD",
  public_key: process.env.MERCHANT_PUBLIC_KEY!,
  // rsa_public_key: process.env.MERCHANT_RSA_PUBLIC_KEY,
});

if (response.status.code === "00" && response.data) {
  const merchant = client.decryptInquiryData(response.data, process.env.PARTNER_RSA_PRIVATE_KEY!);
  console.log(merchant.outlet_name, merchant.enabled_payment_methods);
}
```

`decryptInquiryData` defaults to the documented `MerchantInfo` shape; provide a type argument for other response formats. Decryption requires a Node.js/OpenSSL build that supports RSA PKCS#1 v1.5 private decryption. PayWay application errors are returned in `status`; non-2xx HTTP responses throw `PayWayAPIError` with `status`, `statusText` and `body`.

Inquiry requests log their preparation, request, and response stages to the console, with an `inquiry_id` to correlate events. Configure `logger: (event, details) => ...` to use your own logger, or `logger: false` to disable these logs. Keys and encrypted request data are not included.

## Development

Requires Node.js 18 or newer.

```bash
npm install
npm run build
npm run typecheck
npm test
```

The build produces ESM and CommonJS modules with TypeScript declarations in `dist/`.

## License

MIT
