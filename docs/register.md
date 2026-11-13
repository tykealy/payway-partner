# Register a merchant

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/online-self-activation/new-merchant:
    post:
      summary: Register a merchant
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
        - name: referer
          in: header
          description: >-
            Please ensure that this domain matches the one whitelisted in your
            vendor profile registered on PayWay.
          required: true
          example: ''
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
                  x-apidog-mock: '20210123234559'
                partner_id:
                  type: string
                  maxLength: 250
                  description: >-
                    The encryption string of partner id. This value will provide
                    by ABA side.
                request_data:
                  type: string
                  description: >-
                    The JSON-encoded object of below information encrypt by
                    using RSA public key encryption in chunks. The encrypted
                    data is then concatenated and encoded in Base64 format.



                    ----

                    **pushback_url**  `string` `mandatary`

                    Once merchant complete the registration. PayWay will pass
                    the details of the merchant to this URL. 


                    ----

                    **redirect_url** `string` `mandatory`

                    After completing the registration process, a button appears
                    on the success screen of PayWay. This URL will be embedded
                    in that button, and when the user clicks on it, they will be
                    redirected to the specified URL. The value of this field
                    depends on your activation platform: For native apps: The
                    redirect_url should be in the following format:
                    `{"ios_scheme":"link_to_your_page","android_scheme":"link_to_your_page"}`. 
                    For web applications: The redirect_url should be in the
                    format: `https://your-url.domain`


                    ----

                    **type** `int` 

                    Source of activation platform. If you integrate from native
                    app the value is `1`, for web the avlue is `0`. Default
                    value is `0`.


                    ---

                    **register_ref** `string` `mandatary`

                    Your request reference number. You should send unique value
                    for each request.


                    ---

                    **merchant_type** `int`

                    Merchant type. Possible values: `0` = instore merchant, `1`
                    = online merchant (default value)


                    ---

                    **currency** `string` `mandatary`

                    Merchant currency that you want to register. Possible
                    values: `KHR` or `USD`.


                    ---


                    **PHP Sample Code**

                    ```php

                    $data = [
                        'pushback_url' => 'https://partner-pushback-url.com',
                        'redirect_url' => 'https://partner-redirect-url.com',
                        'type' => 0,
                        'register_ref' => 'Merchant001',
                        'merchant_type' => 1,
                        'currency' => 'KHR'
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
                reference_id:
                  type: string
                  maxLength: 250
                  description: >-
                    The `reference_id` is used for tracking logs at the ABA side
                    when a request is made, and its value should match the
                    `register_ref` value inside the `request_data` parameter. It
                    must be a unique value from previous request. 
                hash:
                  type: string
                  description: >-
                    Base64 encode of hash HMAC SHA256 encryption of concatenates
                    values `partner_id`, `request_data`, and `request_time` with
                    `public_key`.


                    **PHP Sample Code**


                    ```php

                    // partner key provided by ABA Bank

                    $partner_key = "PARTNER KEY PROVIDED BY ABA BANK";
                     
                    // Prepare the data to be hashed

                    $b4hash = $partner_id . $request_data . $request_time;
                     
                    // Generate the HMAC hash using SHA-256

                    $hash = hash_hmac('sha256', $b4hash, $partnerKey);

                    ```
              x-apidog-orders:
                - request_time
                - partner_id
                - request_data
                - reference_id
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
                Uyv+FcEc+QHD3UO/WYhBFH6l02Z0DVTNgrGma8DWXoAGkSxmQUphBFnavaEBDESbg/r+xrE+6aAWtZ+X+MHNMiO3Q8p+y+DDByA+A5V9/UkSs1r4wZ5yRw5wvt9Aqfrr3mqhDJN6EYqtWyxXT3Uk6eJ+Wxi7BHvGOzxbjy1NZ9uSh0hOxJfZ+vljHjr/OldFwYq01Fsq4uuhekZBDYctt7lICf1+rg+g0Mr6YOwBBcTXTdhszMLHlufa3+rM/j4mv3DTR7EODEQLm1zOrPfHM2Yc2Pzlh1kHFMy65gAXYYPTGVxA8v5Y7ZeyfawPgsehWWFsrnIZ87vNg5vSiDrhwUJ62Ep5drEPrXn5rECuyaNBI5iYUDzQrftJP0sXAWbgV6zcdklUzUGA90eg+Fbdd3U6azUhTGGjLTHk5XO4UX8h48JYUzjDg0tPvAH8boHQr/CpKU+XTtvv3ezlcod2s2Iou4ZpmfjTGtkPCTm2KpwkD0hIkEyrD3h6XQY449T/
              reference_id: merchant-001
              hash: e69e7cd7cbe9f221651db05d382c6a8b7a2196eb0f398005357e929dde290dba
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  url:
                    type: string
                    description: >-
                      This is the onboarding form url. Parnter shall redirect
                      user to this URL so that they can do the registration.
                  token:
                    type: string
                    description: The unique token represent the session of the request
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

                          - `PTL141` : The redirect url can not empty.

                          - `PTL142` : The pushback url can not empty.

                          - `PTL137` : Partner id not found

                          - `PTL165` : The register ref can not empty.

                          - `PTL166` : The register ref is invalid format, we
                          allow character and number with underscore or minus.

                          - `PTL164` : The register ref is already exist.

                          - `PTL171` : Please verify the key and the encryption
                          method for the request data, as it appears to be
                          invalid.

                          - `PTL170` : Your profile is deactivated. Please
                          contact integrationteam@ababank.com for more details.

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
                  - url
                  - token
                  - status
              examples:
                '1':
                  summary: Success
                  value:
                    url: ' https://merchant-uat.ababank.com/self-register?partner-token=uMLhq9Q9ucXH8bLF6BtVAJmlUcfMFOQS1PnmHVk0BonKJrDXz+uZF7EwCFAfCCAkA7nMGX3lgltRrm++1HTisuizLHwytuvPyDRk0lS/v4E='
                    token: >-
                      uMLhq9Q9ucXH8bLF6BtVAJmlUcfMFOQS1PnmHVk0BonKJrDXz+uZF7EwCFAfCCAkA7nMGX3lgltRrm++1HTisuizLHwytuvPyDRk0lS/v4E=
                    status:
                      code: '00'
                      message: Success!
                      tran_id: osam-aba_test_037
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530841-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```