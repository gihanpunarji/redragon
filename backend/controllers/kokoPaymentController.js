const crypto = require('crypto');
const db = require('../config/db');
const Order = require('../models/Order');
const { sendOrderInvoiceEmail } = require('../config/email');

// Helper function to reduce product stock
const reduceProductStock = async (orderId) => {
  try {
    // Get order items
    const [items] = await db.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Reduce stock for each product
    for (const item of items) {
      await db.query(
        'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
        [item.quantity, item.product_id]
      );
      console.log(`📦 Reduced stock for product ${item.product_id} by ${item.quantity}`);
    }

    return true;
  } catch (error) {
    console.error('Error reducing product stock:', error);
    throw error;
  }
};

const kokoPaymentController = {
  // Create Koko payment order
  createOrder: async (req, res) => {
    try {
      const {
        orderId,
        amount,
        deliveryCharge = 0,
        firstName,
        lastName,
        email,
        mobile,
        productDescription,
        returnUrl,
        cancelUrl,
        responseUrl
      } = req.body;

      // Validate required fields
      if (!orderId || !amount || !firstName || !lastName || !email || !mobile) {
        return res.status(422).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Get Koko credentials from environment
      const merchantId = process.env.KOKO_MERCHANT_ID;
      const apiKey = process.env.KOKO_API_KEY;
      const privateKey = process.env.KOKO_PRIVATE_KEY;
      const pluginName = process.env.KOKO_PLUGIN_NAME || 'customapi';
      const pluginVersion = process.env.KOKO_PLUGIN_VERSION || '1.0.1';
      const kokoApiUrl = process.env.KOKO_API_URL || (process.env.NODE_ENV === 'production'
        ? (process.env.KOKO_PROD_API_URL || 'https://prodapi.paykoko.com')
        : (process.env.KOKO_QA_API_URL || 'https://qaapi.paykoko.com'));

      console.log('🔌 Koko Payment Config:', {
        merchantId,
        pluginName,
        pluginVersion,
        kokoApiUrl,
        mode: process.env.NODE_ENV
      });

      // Validate credentials
      if (!merchantId || !apiKey || !privateKey) {
        console.error('Missing KOKO credentials:', {
          hasMerchantId: !!merchantId,
          hasApiKey: !!apiKey,
          hasPrivateKey: !!privateKey
        });
        return res.status(400).json({
          success: false,
          message: 'Koko Payment credentials not configured'
        });
      }

      // Calculate final amount: Apply 14% fee to subtotal only, then add delivery
      const originalAmount = parseFloat(amount);
      const deliveryAmount = parseFloat(deliveryCharge);
      const kokoFee = originalAmount * 0.14;
      const finalAmount = (originalAmount + kokoFee + deliveryAmount).toFixed(2);

      // Generate reference: merchantId + random(111-999) + '-' + orderId
      const randomNum = Math.floor(Math.random() * (999 - 111 + 1)) + 111;
      const reference = `${merchantId}${randomNum}-${orderId}`;

      const currency = 'LKR';

      // Create data string in EXACT order as per documentation
      const dataString =
        merchantId +
        finalAmount +
        currency +
        pluginName +
        pluginVersion +
        returnUrl +
        cancelUrl +
        orderId +
        reference +
        firstName +
        lastName +
        email +
        productDescription +
        apiKey +
        responseUrl;

      console.log('🔐 Generated Signature Data String:', JSON.stringify(dataString));

      // Generate signature using RSA-SHA256
      const signature = generateSignature(dataString, privateKey);

      // Prepare form data for Koko
      const formData = {
        url: `${kokoApiUrl}/api/merchants/orderCreate`,
        formData: {
          _mId: merchantId,
          api_key: apiKey,
          _returnUrl: returnUrl,
          _responseUrl: responseUrl,
          _currency: currency,
          _amount: finalAmount,
          _reference: reference,
          _pluginName: pluginName,
          _pluginVersion: pluginVersion,
          _cancelUrl: cancelUrl,
          _orderId: orderId,
          _firstName: firstName,
          _lastName: lastName,
          _email: email,
          _description: productDescription,
          dataString: dataString,
          signature: signature,
          _mobileNo: mobile
        }
      };

      res.json({
        success: true,
        data: formData,
        info: {
          originalAmount: originalAmount.toFixed(2),
          deliveryCharge: deliveryAmount.toFixed(2),
          kokoFee: kokoFee.toFixed(2),
          totalAmount: finalAmount
        }
      });

    } catch (error) {
      console.error('Koko order creation error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to create Koko payment order',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Handle Koko payment response callback
  handleResponse: async (req, res) => {
    try {
      console.log('🔔 Koko webhook received!');
      console.log('Request body:', req.body);

      const { orderId, trnId, status, desc, signature } = req.body;

      console.log('📝 Koko payment response received:', { orderId, trnId, status, desc, hasSignature: !!signature });

      const publicKey = process.env.KOKO_PUBLIC_KEY;

      if (!publicKey) {
        console.error('Koko public key not configured');
        return res.status(400).json({
          success: false,
          message: 'Koko public key not configured'
        });
      }

      // Verify signature
      const dataString = orderId + trnId + status;
      const isValid = verifySignature(dataString, signature, publicKey);

      if (!isValid) {
        console.error('Invalid signature in Koko response');
        return res.status(400).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      // Update order status in database based on payment status
      const connection = await db.getConnection();

      try {
        if (status === 'SUCCESS') {
          // Check if payment was already processed
          const [existingOrder] = await connection.query(
            'SELECT id, payment_status FROM orders WHERE order_number = ?',
            [orderId]
          );

          if (existingOrder.length > 0 && existingOrder[0].payment_status !== 'paid') {
            // Update payment status to paid
            await connection.query(
              `UPDATE orders SET payment_status = 'paid', updated_at = NOW()
               WHERE order_number = ?`,
              [orderId]
            );
            console.log(`Koko payment successful for order: ${orderId}, transaction: ${trnId}`);

            // Reduce product stock
            await reduceProductStock(existingOrder[0].id);
            console.log(`✅ Stock reduced for order ${orderId}`);
          } else if (existingOrder.length > 0) {
            console.log(`⚠️  Payment already processed for order ${orderId}`);
          }

          // Send order confirmation email after successful payment
          try {
            const orderDetails = await Order.getByOrderNumber(orderId);

            if (orderDetails && orderDetails.customer_email) {
              await sendOrderInvoiceEmail(orderDetails.customer_email, {
                order_number: orderDetails.order_number,
                customer_name: orderDetails.customer_name,
                total: orderDetails.total,
                subtotal: orderDetails.subtotal,
                shipping_fee: orderDetails.shipping_fee,
                payment_fee: orderDetails.discount,
                created_at: orderDetails.created_at,
                payment_method_name: orderDetails.payment_method_name,
                items: orderDetails.items,
                address: orderDetails.address,
                city_name: orderDetails.city_name,
                district_name: orderDetails.district_name,
                province_name: orderDetails.province_name,
                postal_code: orderDetails.postal_code,
                shipping_phone: orderDetails.shipping_phone
              });

              console.log(`Order confirmation email sent to ${orderDetails.customer_email} for order ${orderId}`);
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
        } else if (status === 'FAILURE') {
          // Update payment status to failed
          await connection.query(
            `UPDATE orders SET payment_status = 'failed', updated_at = NOW()
             WHERE order_number = ?`,
            [orderId]
          );
          console.log(`Koko payment failed for order: ${orderId}, transaction: ${trnId}`);
        }
      } finally {
        connection.release();
      }

      // Return 200 OK to Koko
      res.status(200).json({
        success: true,
        message: 'Response received'
      });

    } catch (error) {
      console.error('Koko response handling error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing response'
      });
    }
  },

  // Handle return URL
  handleReturn: async (req, res) => {
    try {
      console.log('🔙 Koko return URL hit!');
      console.log('Query params:', req.query);

      const { orderId, trnId, status } = req.query;

      console.log('📝 Koko return details:', { orderId, trnId, status });

      // Redirect to frontend with status using HTML meta refresh
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/payment/success?orderId=${orderId}&trnId=${trnId}&status=${status}`;

      console.log('🔄 Redirecting to:', redirectUrl);

      // Use HTML redirect instead of server redirect
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </head>
          <body>
            <p>Payment successful! Redirecting...</p>
            <script>
              window.location.href = "${redirectUrl}";
            </script>
          </body>
        </html>
      `);

    } catch (error) {
      console.error('Koko return URL error:', error);
      res.status(500).send('Error processing return');
    }
  },

  // Handle cancel URL
  handleCancel: async (req, res) => {
    try {
      const { orderId, trnId, status } = req.query;

      console.log('Koko cancel URL hit:', { orderId, trnId, status });

      // Redirect to frontend cancel page using HTML
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/payment/cancel?orderId=${orderId}&trnId=${trnId}&status=${status}`;

      // Use HTML redirect instead of server redirect
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </head>
          <body>
            <p>Redirecting...</p>
            <script>
              window.location.href = "${redirectUrl}";
            </script>
          </body>
        </html>
      `);

    } catch (error) {
      console.error('Koko cancel URL error:', error);
      res.status(500).send('Error processing cancellation');
    }
  },

  // Check order status (optional)
  checkStatus: async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(422).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const merchantId = process.env.KOKO_MERCHANT_ID;
      const apiKey = process.env.KOKO_API_KEY;
      const privateKey = process.env.KOKO_PRIVATE_KEY;
      const pluginName = process.env.KOKO_PLUGIN_NAME || 'customapi';
      const pluginVersion = process.env.KOKO_PLUGIN_VERSION || '1.0.1';

      if (!merchantId || !apiKey || !privateKey) {
        return res.status(400).json({
          success: false,
          message: 'Koko Payment credentials not configured'
        });
      }

      // Create data string for status check
      const dataString = merchantId + pluginName + pluginVersion + orderId + apiKey;

      // Sign data string
      const signature = generateSignature(dataString, privateKey);

      // For now, return the data needed to make the status check
      // In production, you would make an HTTP request to Koko API
      res.json({
        success: true,
        data: {
          _mId: merchantId,
          api_key: apiKey,
          _orderId: orderId,
          _pluginName: pluginName,
          _pluginVersion: pluginVersion,
          signature: signature
        }
      });

    } catch (error) {
      console.error('Koko status check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check order status'
      });
    }
  }
};

// Helper function to generate RSA-SHA256 signature
function generateSignature(dataString, privateKey) {
  try {
    // Remove quotes and convert \n to actual newlines
    const cleanPrivateKey = privateKey
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dataString);
    sign.end();

    // Use the key with format specification to ensure compatibility
    const signature = sign.sign({
      key: cleanPrivateKey,
      format: 'pem',
      type: 'pkcs1'
    });

    return signature.toString('base64');
  } catch (error) {
    console.error('Signature generation error:', error);
    throw new Error('Failed to generate signature');
  }
}

// Helper function to verify RSA-SHA256 signature
function verifySignature(dataString, signature, publicKey) {
  try {
    // Remove quotes and convert \n to actual newlines
    const cleanPublicKey = publicKey
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n');

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(dataString);
    verify.end();
    return verify.verify(cleanPublicKey, Buffer.from(signature, 'base64'));
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

module.exports = kokoPaymentController;
