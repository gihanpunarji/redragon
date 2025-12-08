const crypto = require('crypto');
const Order = require('../models/Order');
const { sendOrderInvoiceEmail } = require('../config/email');

const payhereController = {
    // Generate PayHere payment hash
  generateHash: (req, res) => {
    try {
      const {
        order_id,
        amount,
        currency,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        country
      } = req.body;

      const merchant_id = process.env.PAYHERE_MERCHANT_ID;
      const merchant_secret = process.env.PAYHERE_SECRET;

      console.log('🔐 PayHere Hash Generation:');
      console.log('Merchant ID:', merchant_id);
      console.log('Order ID:', order_id);
      console.log('Amount:', amount);
      console.log('Currency:', currency);

      // PayHere hash generation format (updated 2023-01-16)
      const formatted_amount = parseFloat(amount).toFixed(2);
      const merchant_secret_hash = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
      const hash_string = merchant_id + order_id + formatted_amount + currency + merchant_secret_hash;

      console.log('Formatted Amount:', formatted_amount);
      console.log('Hash String:', hash_string);

      // Generate MD5 hash
      const hash = crypto.createHash('md5').update(hash_string).digest('hex').toUpperCase();

      console.log('Generated Hash:', hash);
      res.json({
        success: true,
        data: {
          merchant_id,
          order_id,
          amount: formatted_amount,
          currency,
          hash,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          country,
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          notify_url: `${req.protocol}://${req.get('host')}/api/payhere/notify`
        }
      });
    } catch (error) {
      console.error('PayHere hash generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate payment hash'
      });
    }
  },

  // Handle PayHere payment notification
  handleNotification: async (req, res) => {
    try {
      const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig
      } = req.body;

      const merchant_secret = process.env.PAYHERE_SECRET;
      
      // Verify the signature (updated format)
      const merchant_secret_hash = crypto.createHash('md5').update(merchant_secret).digest('hex');
      const local_md5sig = crypto
        .createHash('md5')
        .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + merchant_secret_hash)
        .digest('hex')
        .toUpperCase();

      if (local_md5sig === md5sig) {
        // Signature is valid
        if (status_code == 2) {
          // Payment success
          console.log(`✅ PayHere payment successful for order: ${order_id}`);

          // Update payment status to 'paid' and reduce stock
          try {
            const orderDetails = await Order.getByOrderNumber(order_id);

            if (orderDetails) {
              // Check if already processed
              if (orderDetails.payment_status !== 'paid') {
                // Update payment status to 'paid'
                await Order.updatePaymentStatus(orderDetails.id, 'paid');
                console.log(`💳 Payment status updated to 'paid' for order ${order_id}`);

                // Reduce stock for each product
                const [items] = await db.query(
                  'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                  [orderDetails.id]
                );

                for (const item of items) {
                  await db.query(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                  );
                  console.log(`📦 Reduced stock for product ${item.product_id} by ${item.quantity}`);
                }
                console.log(`✅ Stock reduced for order ${order_id}`);
              } else {
                console.log(`⚠️  Payment already processed for order ${order_id}`);
              }
            }
          } catch (updateError) {
            console.error('Failed to update payment status:', updateError);
          }

          // Send order confirmation email after successful payment
          try {
            const orderDetails = await Order.getByOrderNumber(order_id);

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

              console.log(`Order confirmation email sent to ${orderDetails.customer_email} for order ${order_id}`);
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
        } else {
          // Payment failed or cancelled
          console.log(`Payment failed for order: ${order_id}, status: ${status_code}`);
        }
        
        res.status(200).send('OK');
      } else {
        console.log('Invalid signature in PayHere notification');
        res.status(400).send('Invalid signature');
      }
    } catch (error) {
      console.error('PayHere notification error:', error);
      res.status(500).send('Error processing notification');
    }
  }
};

module.exports = payhereController;