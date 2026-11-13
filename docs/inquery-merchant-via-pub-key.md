# Inquiry merchant info via Merchant public key

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/online-self-activation/get-mc-info:
    post:
      summary: Inquiry merchant info via Merchant public key
      deprecated: false
      description: >+
        This API allows you to get merchant information using
        merchant`public_key`.


        Here is the sample response information upon a successful request:


        ```json

        {
            "data": "FZf2iTBD10ZLIGlG3ACuBHhrXXK/27+OKNjaUZSIf+HdWqTPIHrBj5Demfh+utIOHOqEZkFkdKA0PHPZ5JDfeENpcnYw5+QbsHAKV4knsUJbdnJDWfoPd+7pX6i3qMXF2bY1kqV8fpllxV+WRoRhVWMGVU99ZQAcfAfQowMLQ7BN+4cJeNZuHF1VZa90h8FBc+QIR2wY8r8OlqAKssv6NO2RYi6aZCOJlBNO9fApBrDoihgZOxnhhBKVUpeTcToumfAnP3QEXizrWMcwvk88yGlCZuAovFPQuJFQu+L1LcPjRl8HVvMru0qLsp/c5dWxez1ZVGvts/aULTMrF04zA2GEsdcHbz3v6tkP2KyLp93wPBI5yVLU26b8G5nJVi4D0ysZXeAvFyCLmG59wPjfyXIr/khikaLUMlTq1lDxDvN7FUsLrT7JKTmbqnK+NgtPRoF6z7Jc06uA6OXWvu7gaGxFVtATQVbcMeEuP++lBFFVd2ToymFnoOTeYJ4FFSDP",
            "status": {
                "code": "00",
                "message": "Success!",
                "trace_id": "9dd02d9c-d4fe-4c5f-92e1-81c1e86a0d0a"
            }
        }

        ```


        The merchant information is encrypted under `data` field. Below is the
        sameple PHP code to decryp the info:


        ```php

        public static function opensslDecryption($source, $privateKey)

        {
          // Process in 128 Byte chunks for long text decryption
          $source = base64_decode($source);
          $maxlength = 128;
          $output = '';
          
          while ($source) {
            $input  = substr($source, 0, $maxlength);
            $source = substr($source, $maxlength);
            $ok     = openssl_private_decrypt($input, $out, $privateKey);
            $output .= $out;
          }
          
          return $output;
        }

        ```


        Here is the sample result after decryption:


        ```

        {
           "outlet_name":"Instore O by S.KHUT",
           "aba_account_khr":"",
           "aba_account_usd":"888802222",
           "available_payment_methods":{
              "alipay":"Alipay",
              "wechat":"WeChat Pay"
           },
           "enabled_payment_methods":{
              "abapay_khqr":"ABA Pay KHQR"
           },
           "pending_payment_methods":{
              "cards":"Credit/Debit Card"
           }
        }

        ```

      tags:
        - Partner
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: application/json
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                request_time:
                  type: string
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                partner_id:
                  type: string
                  description: >-
                    The encryption string of partner id. This value will provide
                    by ABA Bank.
                request_data:
                  type: string
                  description: >
                    The JSON-encoded object and encrypt using RSA public key
                    encryption in chunks.


                    **PHP Sample Code**

                    ```php

                    $hash_encrypt_string = $partner_id . $merchant_key .
                    $request_time;

                    $public_key = "Merchant public key";

                    $rsa_public_key ="Merchant rsa publick key";


                    $data = [
                        'merchant_key' => 'EC0002', 
                        'currency' => 'USD', 
                        'public_key_hash_encrypt' => hash_hmac('sha512', $hash_encrypt_string, $public_key),
                        'rsa_public_key_hash_encrypt' => opensslEncrypt($hash_encrypt_string, $rsa_public_key)
                    ];


                    $source = json_encode($data);


                    public static function opensslEncrypt($source, $publicKey)

                    {
                       //Assumes 1024 bit key and encrypts in chunks.
                       $maxlength = 117;
                       $output = '';
                       while ($source) {
                          $input  = substr($source, 0, $maxlength);
                          $source = substr($source, $maxlength);
                          $ok     = openssl_public_encrypt($input, $encrypted, $publicKey);
                          $output .= $encrypted;
                       }
                       return base64_encode($output);
                    }

                    ```


                    ----

                    **merchant_key** `string` `mandatory`

                    Your merchant key provided by ABA Bank.


                    ----

                    **currency** `string` `mandatory`

                    USD or KHR


                    ---

                    **public_key_hash_encrypt** `string` `mandatory`

                    Encrypted public key provided by ABA Bank.


                    ---

                    **rsa_public_key_hash_encrypt** `string` `optional`

                    Encrypted public rsa public key provided by ABA Bank.


                    ---
                hash:
                  type: string
                  description: >-
                    Base64 encode of hash HMAC SHA256 encryption of concatenates
                    values `partner_id`, `request_data` and `request_time`  with
                    `public_key`.


                    **PHP Sample Code**


                    ```php

                    // partner key provided by ABA Bank

                    $partnerKey = "PARTNER KEY PROVIDED BY ABA BANK";
                     
                    // Prepare the data to be hashed

                    $b4hash = $partner_id . $request_data . $request_time;
                     
                    // Generate the HMAC hash using SHA-256

                    $hash = hash_hmac('sha256', $b4hash, $partnerKey);

                    ```
              x-apidog-orders:
                - request_time
                - partner_id
                - request_data
                - hash
              required:
                - request_time
                - partner_id
                - request_data
                - hash
            example:
              request_time: '20201019073518'
              partner_id: zrH94FN0VmyQx7GS1Ir21A==
              request_data: >-
                a/lHnhQ9Sa4zf9feh9TeVUExcEPiztzyjZd0aoWay+98lPXgNRbDBt42qi4wy2wGIPKWTif4Ha6kkrrmhDq5tVtdADCjP0DOJFassV4cehXuZHfWuFXXUymmCFk0n+C26YliIDLEv0y03t7bRHusBi6YbW/O05pyIk5LOVi0ybA=
              hash: 3457106c8372da29b84a7f5c83c503e84ff23aa11706a98f8a4c8489c6fb821c
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: string
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        description: >-
                          - `00` : Success!

                          - `PTL02` : Wrong Hash

                          - `PTL04` : Parameter Validation Required

                          - `PTL06` : The Request is Expired

                          - `PTL46` : Merchant not found

                          - `PTL137` : Partner id not found

                          - `PTL170` : Your profile is deactivated. Please
                          contact integrationteam@ababank.com for more details

                          - `PTL175` : Requested Domain is not in whitelist.
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      trace_id:
                        type: string
                        title: ''
                        description: >-
                          A log ID is generated by the PayWay system for
                          debugging purposes.
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                    required:
                      - code
                      - message
                      - trace_id
                x-apidog-orders:
                  - data
                  - status
                required:
                  - data
                  - status
              examples:
                '1':
                  summary: Success
                  value:
                    data: >-
                      FZf2iTBD10ZLIGlG3ACuBHhrXXK/27+OKNjaUZSIf+HdWqTPIHrBj5Demfh+utIOHOqEZkFkdKA0PHPZ5JDfeENpcnYw5+QbsHAKV4knsUJbdnJDWfoPd+7pX6i3qMXF2bY1kqV8fpllxV+WRoRhVWMGVU99ZQAcfAfQowMLQ7BN+4cJeNZuHF1VZa90h8FBc+QIR2wY8r8OlqAKssv6NO2RYi6aZCOJlBNO9fApBrDoihgZOxnhhBKVUpeTcToumfAnP3QEXizrWMcwvk88yGlCZuAovFPQuJFQu+L1LcPjRl8HVvMru0qLsp/c5dWxez1ZVGvts/aULTMrF04zA2GEsdcHbz3v6tkP2KyLp93wPBI5yVLU26b8G5nJVi4D0ysZXeAvFyCLmG59wPjfyXIr/khikaLUMlTq1lDxDvN7FUsLrT7JKTmbqnK+NgtPRoF6z7Jc06uA6OXWvu7gaGxFVtATQVbcMeEuP++lBFFVd2ToymFnoOTeYJ4FFSDP
                    status:
                      code: '00'
                      message: Success!
                      trace_id: 9dd02d9c-d4fe-4c5f-92e1-81c1e86a0d0a
                '2':
                  summary: Exception
                  value:
                    status:
                      code: PTL02
                      message: Wrong Hash
          headers: {}
          x-apidog-name: Success
      security: []
      x-apidog-folder: Partner
      x-apidog-status: testing
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-32036729-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```