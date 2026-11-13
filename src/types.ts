export interface PayWayPartnerConfig {
  base_url: string;
  partner_id: string;
  partner_key: string;
  rsa_public_key: string;
  referer: string;
  hash_encoding?: "hex" | "base64";
}

export type Currency = "USD" | "KHR";

export interface RegisterMerchantParams {
  pushback_url: string;
  redirect_url: string | { ios_scheme: string; android_scheme: string };
  type?: 0 | 1;
  register_ref: string;
  merchant_type?: 0 | 1;
  currency: Currency;
}

export interface InquiryByPublicKeyParams {
  merchant_key: string;
  currency: Currency;
  public_key: string;
  rsa_public_key?: string;
}

export interface PartnerRequestFields {
  request_time: string;
  partner_id: string;
  request_data: string;
  hash: string;
  reference_id?: string;
}

export interface PayloadBuilderResponse<T = PartnerResponse> {
  url: string;
  method: "POST";
  contentType: "application/json";
  headers: Record<string, string>;
  fields: PartnerRequestFields;
  body: PartnerRequestFields;
  readonly __response?: T;
}

export interface PartnerStatus {
  code: string;
  message: string;
  trace_id?: string;
  tran_id?: string;
}

export interface PartnerResponse {
  status: PartnerStatus;
}
export interface RegisterMerchantResponse extends PartnerResponse {
  url?: string;
  token?: string;
}
export interface InquiryResponse extends PartnerResponse {
  data?: string;
}
export interface MerchantInfo {
  outlet_name: string;
  aba_account_khr: string;
  aba_account_usd: string;
  available_payment_methods: Record<string, string>;
  enabled_payment_methods: Record<string, string>;
  pending_payment_methods: Record<string, string>;
}
