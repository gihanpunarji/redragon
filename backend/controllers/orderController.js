const db = require('../config/db');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const { sendOrderInvoiceEmail } = require('../config/email');

const orderController = {
  // Create a new order
  createOrder: async (req, res) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        order_number,
        subtotal,
        shipping_fee,
        payment_fee,
        total,
        payment_method,
        shipping_info,
        items
      } = req.body;
      
      const customer_id = req.user.id;

      // Check if order already exists (prevent duplicates)
      const [existingOrder] = await connection.query(
        'SELECT id FROM orders WHERE order_number = ?',
        [order_number]
      );

      if (existingOrder.length > 0) {
        await connection.commit();
        return res.json({
          success: true,
          message: 'Order already exists',
          data: {
            order_id: existingOrder[0].id,
            order_number
          }
        });
      }

      // Get payment method ID
      const [paymentMethods] = await connection.query(
        'SELECT id FROM payment_methods WHERE slug = ?',
        [payment_method]
      );

      if (paymentMethods.length === 0) {
        throw new Error('Invalid payment method');
      }
      
      const payment_method_id = paymentMethods[0].id;
      
      // Create shipping address first
      let shipping_address_id = null;
      if (shipping_info) {
        const [addressResult] = await connection.query(
          `INSERT INTO shipping_addresses (
            customers_customer_id, phone, address_line1, address_line2, 
            city_name, district_name, province_name, postal_code, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            customer_id,
            shipping_info.phone,
            shipping_info.addressLine1,
            shipping_info.addressLine2,
            shipping_info.city,
            shipping_info.district,
            shipping_info.province,
            shipping_info.postalCode
          ]
        );
        shipping_address_id = addressResult.insertId;
      }
      
      // Insert order with shipping_address_id (pending status until payment succeeds)
      const [orderResult] = await connection.query(
        `INSERT INTO orders (
          order_number, customer_id, subtotal, shipping_fee, discount, total,
          payment_method_id, payment_status, order_status, shipping_address_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, NOW(), NOW())`,
        [
          order_number,
          customer_id,
          subtotal,
          shipping_fee,
          payment_fee, // Using payment_fee as discount field for now
          total,
          payment_method_id,
          shipping_address_id
        ]
      );
      
      const order_id = orderResult.insertId;
      
      // Insert order items
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_image, 
            price, quantity, subtotal, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            order_id,
            item.product_id,
            item.product_name,
            item.product_image,
            item.price,
            item.quantity,
            item.subtotal
          ]
        );
      }
      
      await connection.commit();

      // Note: Invoice email will be sent after payment confirmation
      // Email is triggered by payment gateway webhooks (KOKO/PayHere)

      res.json({
        success: true,
        message: 'Order created successfully',
        data: {
          order_id,
          order_number
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    } finally {
      connection.release();
    }
  },

  // Get user's orders
  getUserOrders: async (req, res) => {
    try {
      const customer_id = req.user.id;
      
      const [orders] = await db.query(
        `SELECT
          o.id, o.order_number, o.subtotal, o.shipping_fee, o.discount,
          o.total, o.payment_status, o.order_status, o.created_at,
          o.tracking_number, o.courier_name,
          pm.name as payment_method
        FROM orders o
        LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC`,
        [customer_id]
      );
      
      // Get order items for each order
      for (let order of orders) {
        const [items] = await db.query(
          `SELECT product_id, product_name, product_image, price, quantity, subtotal
          FROM order_items WHERE order_id = ?`,
          [order.id]
        );
        order.items = items;
      }
      
      res.json({
        success: true,
        data: orders
      });
      
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const customer_id = req.user.id;
      
      const [orders] = await db.query(
        `SELECT
          o.*, pm.name as payment_method
        FROM orders o
        LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
        WHERE o.id = ? AND o.customer_id = ?`,
        [id, customer_id]
      );
      
      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      const order = orders[0];
      
      // Get order items
      const [items] = await db.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [id]
      );
      
      order.items = items;
      
      res.json({
        success: true,
        data: order
      });
      
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  },

  // Admin: Get all orders
  getAllOrdersForAdmin: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const search = req.query.search;

      let orders;

      if (search) {
        // Search orders by order number or customer name
        orders = await Order.search(search, limit, offset);
      } else if (status && status !== 'all') {
        // Filter by status
        orders = await Order.getByStatus(status, limit, offset);
      } else {
        // Get all orders
        orders = await Order.getAll(limit, offset);
      }

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        pagination: {
          page,
          limit,
          total: orders.length
        }
      });
    } catch (err) {
      console.error('Get orders error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.'
      });
    }
  },

  // Admin: Get order by ID (with all details)
  getOrderByIdForAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.getById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (err) {
      console.error('Get order by ID error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.'
      });
    }
  },

  // Admin: Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { order_status, tracking_number, courier_name } = req.body;

      // Validate order status
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(order_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        });
      }

      // Check if order exists
      const existingOrder = await Order.getById(id);
      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status
      const updated = await Order.updateStatus(id, order_status, tracking_number, courier_name);

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update order status'
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } catch (err) {
      console.error('Update order status error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.'
      });
    }
  },

  // Admin: Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;

      // Validate payment status
      const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validStatuses.includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }

      // Check if order exists
      const existingOrder = await Order.getById(id);
      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update payment status
      const updated = await Order.updatePaymentStatus(id, payment_status);

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update payment status'
        });
      }

      res.json({
        success: true,
        message: 'Payment status updated successfully'
      });
    } catch (err) {
      console.error('Update payment status error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.'
      });
    }
  },

  // Cleanup old pending orders (older than 24 hours)
  cleanupPendingOrders: async (req, res) => {
    try {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Delete order items for old pending orders
        await connection.query(`
          DELETE oi FROM order_items oi
          INNER JOIN orders o ON oi.order_id = o.id
          WHERE o.payment_status = 'pending'
          AND o.created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        // Delete old pending orders
        const [result] = await connection.query(`
          DELETE FROM orders
          WHERE payment_status = 'pending'
          AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        await connection.commit();

        console.log(`🧹 Cleaned up ${result.affectedRows} old pending orders`);

        res.json({
          success: true,
          message: `Cleaned up ${result.affectedRows} old pending orders`
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Cleanup pending orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup pending orders'
      });
    }
  },

  // Check order status (public endpoint for payment success page)
  checkOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const [orde] = await db.query(
        'SELECT payment_status, order_status FROM orders WHERE order_number = ?',
        [orderId]
      );

      if (orde.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: {
          payment_status: orde[0].payment_status,
          order_status: orde[0].order_status
        }
      });
    } catch (error) {
      console.error('Error checking order status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check status'
      });
    }
  },
};

module.exports = orderController;