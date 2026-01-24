const crypto = require('crypto');
const axios = require('axios');

// Test PayHere webhook notification
async function testPayhereWebhook() {
  // Your credentials from .env
  const merchant_id = process.env.PAYHERE_MERCHANT_ID || '1222676';
  const merchant_secret = process.env.PAYHERE_SECRET || 'MTQxNjIyNjMzNjE1OTExOTg1NTUxMTQwNTIzOTQzMzMxODY0MzQ0Mg==';

  // Test data - REPLACE order_id with a REAL pending order from your database
  const order_id = 'ORD1765178045128'; // ⚠️ CHANGE THIS to a real pending order number
  const payhere_amount = '1000.00'; // Amount of the test order
  const payhere_currency = 'LKR';
  const status_code = '2'; // 2 = Success

  // Generate the md5sig the same way PayHere does
  const merchant_secret_hash = crypto
    .createHash('md5')
    .update(merchant_secret)
    .digest('hex');

  const md5sig = crypto
    .createHash('md5')
    .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + merchant_secret_hash)
    .digest('hex')
    .toUpperCase();

  const webhookData = {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    payment_id: 'TEST123456', // Test payment ID
    payhere_amount_paid: payhere_amount,
    method: 'TEST',
    status_message: 'Test payment',
    card_holder_name: 'Test User',
    card_no: '************1234',
    card_expiry: '1225'
  };

  console.log('🧪 Testing PayHere Webhook');
  console.log('📤 Sending webhook data:');
  console.log(JSON.stringify(webhookData, null, 2));
  console.log('\n');

  try {
    // Test locally
    const localUrl = 'http://localhost:5001/api/payhere/notify';

    console.log(`📡 Sending to: ${localUrl}`);
    const response = await axios.post(localUrl, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Webhook test successful!');
    console.log('Response:', response.status, response.statusText);
    console.log('\n');
    console.log('🎉 Check your database:');
    console.log(`   - Order ${order_id} should have payment_status = 'paid'`);
    console.log(`   - Stock should be reduced`);
    console.log(`   - Confirmation email should be sent`);

  } catch (error) {
    console.error('❌ Webhook test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testPayhereWebhook();
