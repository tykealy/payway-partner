# Inquiry merchant info via register ref

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/online-self-activation/get-mc-credential-info:
    post:
      summary: Inquiry merchant info via register ref
      deprecated: false
      description: ''
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

                    $data = [
                        'register_ref' => 'REQ-0012' // Your request reference number. 
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
                    description: Encrypted merchant detail.
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
                    x-apidog-orders:
                      - code
                      - message
                    required:
                      - code
                      - message
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
                      hmzyUCnkRjleBeyaKPUtCLY69J3lP6HpwintSXDatgnn0tL7Ew4evDSqn5ldkTz4WCtk9hcmURDNDA8+8IT1MKvhc9JJCmrF3ddFI1u9zlhUMVrP2ICrSVepgx9ce8/YqdXgx/lA69MZc2BljjTog2oOQ3HQNVqVzJ2YXoWBugCsMJr6HSh2dV52/pOv8v6YhUbnXiy3xd+/Atb7adrBND3LjJATKim6dVSdky3zOkLycRKKsypayhSWajBlVkWci80rrh7YkfX+tZqMtKjux8iz2TsEsolmlaqJ7pljkG7xw8O7JdU+Qhl68Vz8m9dfo1VvlnADqyfYWZD2shPLdg==
                    status:
                      code: '00'
                      message: Success!
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
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14569697-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```