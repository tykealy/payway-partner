import { createHmac } from "node:crypto";
import { decryptWithRSA, encryptWithRSA } from "./crypto.js";
import { execute } from "./execute.js";
import { formatRequestTime } from "./utils.js";
import type {
  InquiryByPublicKeyParams,
  InquiryResponse,
  MerchantInfo,
  PartnerRequestFields,
  PartnerResponse,
  PayloadBuilderResponse,
  PayWayPartnerConfig,
  RegisterMerchantParams,
  RegisterMerchantResponse,
} from "./types.js";

export class PayWayPartnerClient implements PayWayPartnerConfig {
  readonly base_url: string;
  readonly partner_id: string;
  readonly partner_key: string;
  readonly rsa_public_key: string;
  readonly referer: string;
  readonly hash_encoding: "hex" | "base64";

  constructor(config: PayWayPartnerConfig) {
    this.base_url = config.base_url;
    this.partner_id = config.partner_id;
    this.partner_key = config.partner_key;
    this.rsa_public_key = config.rsa_public_key;
    this.referer = config.referer;
    this.hash_encoding = config.hash_encoding ?? "hex";
  }

  private buildPayload<T extends PartnerResponse>(
    path: string,
    data: object,
    requestTime: string,
    referenceId?: string,
  ): PayloadBuilderResponse<T> {
    const request_data = encryptWithRSA(
      this.rsa_public_key,
      JSON.stringify(data),
    );
    const hash = createHmac("sha256", this.partner_key)
      .update(this.partner_id + request_data + requestTime)
      .digest(this.hash_encoding);
    const fields: PartnerRequestFields = {
      request_time: requestTime,
      partner_id: this.partner_id,
      request_data,
      hash,
    };
    if (referenceId !== undefined) fields.reference_id = referenceId;
    return {
      url: `${this.base_url.replace(/\/+$/, "")}/api/merchant-portal/online-self-activation/${path}`,
      method: "POST",
      contentType: "application/json",
      headers: { "Content-Type": "application/json", referer: this.referer },
      fields,
      body: fields,
    };
  }

  registerMerchant(
    params: RegisterMerchantParams,
  ): Promise<RegisterMerchantResponse> {
    return execute(
      this.buildPayload<RegisterMerchantResponse>(
        "new-merchant",
        params,
        formatRequestTime(new Date()),
        params.register_ref,
      ),
    );
  }

  getMerchantByReference(register_ref: string): Promise<InquiryResponse> {
    return execute(
      this.buildPayload<InquiryResponse>(
        "get-mc-credential-info",
        { register_ref },
        formatRequestTime(new Date()),
      ),
    );
  }

  getMerchantByPublicKey(
    params: InquiryByPublicKeyParams,
  ): Promise<InquiryResponse> {
    const time = formatRequestTime(new Date());
    const proof = this.partner_id + params.merchant_key + time;
    const data: Record<string, string> = {
      merchant_key: params.merchant_key,
      currency: params.currency,
      public_key_hash_encrypt: createHmac("sha512", params.public_key)
        .update(proof)
        .digest("hex"),
    };
    if (params.rsa_public_key)
      data.rsa_public_key_hash_encrypt = encryptWithRSA(
        params.rsa_public_key,
        proof,
      );
    return execute(
      this.buildPayload<InquiryResponse>("get-mc-info", data, time),
    );
  }

  decryptInquiryData<T = MerchantInfo>(data: string, privateKey: string): T {
    return JSON.parse(decryptWithRSA(privateKey, data)) as T;
  }
}
