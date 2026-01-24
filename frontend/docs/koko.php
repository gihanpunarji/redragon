<?php
$order_id=123;
$merchant = 'c8cca514bdfa0582cdc40c9703c71e9d';
$amount = 5000;
$currency = 'LKR';
$pluginName = "customapi";
$pluginVersion = 1;
$reference = $merchant . rand(111, 999) . '-' . $order_id;
$firstName = 'Joe';
$lastName = 'Kate';
$email = 'webivox@gmail.com';
$mobile = '0777904054';
$apiKey = '83fA5n1xUaj8OKnX23YY5vlni5q39gBi';
$redirect_url = 'https://www.beimmune.lk/';

$productName = "1 Product";

$private_key = '-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----';






$dataString = $merchant . $amount . $currency . $pluginName . $pluginVersion . $redirect_url . $redirect_url . $order_id .
$reference . $firstName . $lastName . $email . $productName . $apiKey. $redirect_url;

$pkeyid = openssl_get_privatekey($private_key);
if (!openssl_sign($dataString, $signature, $pkeyid, OPENSSL_ALGO_SHA256)) {
   $signatureEncoded = openssl_error_string();
}else{
   $signatureEncoded = base64_encode($signature);
}
openssl_free_key($pkeyid);


$darazbnpl_args = array(
	'_mId' => $merchant,
	'api_key' => $apiKey,
	'_returnUrl' => $redirect_url,
	'_responseUrl' => $redirect_url,
	'_currency' => $currency,
	'_amount' => $amount,
	'_reference' => $reference,
	'_pluginName' => $pluginName,
	'_pluginVersion' => $pluginVersion,
	'_cancelUrl' => $redirect_url,
	'_orderId' => $order_id,
	'_firstName' => $firstName,
	'_lastName' => $lastName,
	'_email' => $email,
	'_description' => $productName,
	'dataString' => $dataString,
	'signature' => $signatureEncoded,
	// '_type' => 'ONE_TIME',
	'_mobileNo' => $mobile
);

$darazbnpl_args_array = array();
foreach ($darazbnpl_args as $key => $value) {
	$darazbnpl_args_array[] = "<input type='hidden' name='$key' value='$value'/>";
}


$url = 'https://qaapi.paykoko.com/api/merchants/orderCreate';

echo '    <form action="' . $url . '" method="post" id="darazbnpl_payment_form">
                ' . implode('', $darazbnpl_args_array) . '
                <input type="submit" class="button-alt" id="submit_darazbnpl_payment_form" value="NExt" /> <a class="button cancel" href="' . $redirect_url . '">Cancel</a>
                    <script type="text/javascript">
                    jQuery(function(){
                    jQuery("body").block({
                        message: Thanks for your order! We are now redirecting you to DarazBNPL Payment Gateway to make the payment.,
                        overlayCSS: {
                            background      : "#fff",
                            opacity         : 0.8
                        },
                        css: {
                            padding         : 20,
                            textAlign       : "center",
                            color           : "#333",
                            border          : "1px solid #eee",
                            backgroundColor : "#fff",
                            cursor          : "wait",
                            lineHeight      : "32px"
                        }
                    });
                    jQuery("#submit_darazbnpl_payment_form").click();});
                    </script>
                </form>';