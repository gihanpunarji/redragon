<?php

function kokopay()
{
    // Static test values
    $order_id = 'ORD123';
    $merchant = 'c8cca514bdfa0582cdc40c9703c71e9d';
    $amount = '300.00';
    $currency = 'LKR';
    $pluginName = 'customapi';
    $pluginVersion = '1.0.1';
    $reference = 'REF123';
    $firstName = 'John';
    $lastName = 'Doe';
    $email = 'john@gmail.com';
    $mobile = '0777904054';
    $apiKey = '83fA5n1xUaj8OKnX23YY5vlni5q39gBi';

    $responseUrl = 'https://www.beimmune.lk/response';
    $returnUrl = 'https://www.beimmune.lk/return';
    $cancelUrl = 'https://www.beimmune.lk/cancel';
    $productName = 'products';

    // KokoPay required data string (order is critical!)
    $dataString = $merchant . $amount . $currency . $pluginName . $pluginVersion .
        $returnUrl . $cancelUrl . $order_id . $reference .
        $firstName . $lastName . $email . $productName .
        $apiKey . $responseUrl;

    // Load the private key (test key provided)
    $privKeyString = <<<KEY
-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCnAPcpmvA3Iipb7Fn+eAmO/P4Xv8y+PVm8FrDhqOSeMqaUQmzf
iZ6xw+ejCmye46MMW5SaA03Hnm0WGDXqYhMR0TiWUgXRCeQImxSq+wXwd+0ufxW+
ANnvH9l/mxcPwlGr2BKJTUJy2NQt8FZ9R6NSfIlKzdyGStvzF3j0KdBnjQIDAQAB
AoGAVMjwsnaurc7yomiD5+UZNTbL6VK+p3aOMCd09ZvBNW+RkoOGspYzsxw6ZVPN
gX0gMg3si6RRwJ5101nHRY81DmysZ90kgJsknqxUuwKGU6k2Wk18JqJBLGLXilwR
Z5/NjdgohoZDrJbbr029LNLZ06pvpdXtvVRM9A1XZVzEnAECQQDQ02Wg7nGFvS4M
yRWMHNARLto19W/Q+BlCsWRCDYO5zns9BtaqzZ3CyOAaXObDs6ZWpCEY+3e84u3X
pvBpdOGtAkEAzLr15YBG9Y3hQgErwIUd0dSlYiDzaIM9DszIh+lzCIi/bUM6nXQi
IZ0zDJmLjwa0bMduO+ZDiUbxuCFlxhEZYQJAdpTEbhlYr4gYwTvil3i5EjjXwrJH
t5NazMts0jFYbsd4pdPfTIiMIFLvJylABTtbpnF3Nfd+K+10//OVK10q1QJBAMLU
qW3exaipfNTziE+OXvJxC3J3KS0st85909iDsZVNjd7NO9rbyh9zGkHDXayfFNTw
dVdLqrnZae9w2QnE/AECQF+cRPcQMA1wbmOBCyn/C1YAMji71DtplJF9fFOxlp9P
XdzBrBj9flrwjasEs3WKrepvZ9A0GT5HaG15ULd2/rc=
-----END RSA PRIVATE KEY-----
KEY;

    $private_key = openssl_get_privatekey($privKeyString);

    if (!openssl_sign($dataString, $signature, $private_key, OPENSSL_ALGO_SHA256)) {
        $signatureEncoded = openssl_error_string();
    } else {
        $signatureEncoded = base64_encode($signature);
    }

    $koko_args = [
        '_mId' => $merchant,
        'api_key' => $apiKey,
        '_returnUrl' => $returnUrl,
        '_responseUrl' => $responseUrl,
        '_currency' => $currency,
        '_amount' => $amount,
        '_reference' => $reference,
        '_pluginName' => $pluginName,
        '_pluginVersion' => $pluginVersion,
        '_cancelUrl' => $cancelUrl,
        '_orderId' => $order_id,
        '_firstName' => $firstName,
        '_lastName' => $lastName,
        '_email' => $email,
        '_description' => $productName,
        'dataString' => $dataString,
        'signature' => $signatureEncoded,
        '_mobileNo' => $mobile
    ];

    $hidden_inputs = '';
    foreach ($koko_args as $key => $value) {
        $hidden_inputs .= "<input type='hidden' name='$key' value='" . htmlspecialchars($value, ENT_QUOTES) . "'/>\n";
    }

    $url = 'https://qaapi.paykoko.com/api/merchants/orderCreate';

    echo <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>KokoPay Test</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://malsup.github.io/jquery.blockUI.js"></script>
</head>
<body>
<form action="$url" method="post" id="darazbnpl_payment_form">
    $hidden_inputs
    <input type="submit" class="button-alt" id="submit_darazbnpl_payment_form" value="Proceed to Payment" />
    <a class="button cancel" href="$cancelUrl">Cancel</a>
</form>
<script type="text/javascript">
    jQuery(function(){
        jQuery("body").block({
            message: 'Thanks for your order! Redirecting to Koko Payment Gateway...',
            overlayCSS: {
                background: "#fff",
                opacity: 0.8
            },
            css: {
                padding: 20,
                textAlign: "center",
                color: "#333",
                border: "1px solid #eee",
                backgroundColor: "#fff",
                cursor: "wait",
                lineHeight: "32px"
            }
        });
        jQuery("#submit_darazbnpl_payment_form").click();
    });
</script>
</body>
</html>
HTML;
}

// Call the function
kokopay();
