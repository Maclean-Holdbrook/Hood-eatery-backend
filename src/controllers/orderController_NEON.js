// NEON POSTGRESQL VERSION - Replace orderController.js with this content
import { sql } from '../config/database.js';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      items,
      paymentMethod,
      notes
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 5.00; // You can make this dynamic based on distance
    const total = subtotal + deliveryFee;

    const orderNumber = generateOrderNumber();

    // Create order
    const orders = await sql`
      INSERT INTO orders (
        user_id, order_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_lat, delivery_lng, subtotal, delivery_fee,
        total, payment_method, notes, status
      )
      VALUES (
        ${req.user?.id || null},
        ${orderNumber},
        ${customerName},
        ${customerEmail},
        ${customerPhone},
        ${deliveryAddress},
        ${deliveryLat},
        ${deliveryLng},
        ${subtotal},
        ${deliveryFee},
        ${total},
        ${paymentMethod},
        ${notes},
        'pending'
      )
      RETURNING *
    `;

    const order = orders[0];

    // Create order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id, menu_item_id, menu_item_name, quantity, price, subtotal
        )
        VALUES (
          ${order.id},
          ${item.id},
          ${item.name},
          ${item.quantity},
          ${item.price},
          ${item.price * item.quantity}
        )
      `;
    }

    // Fetch the complete order with items
    const completeOrders = await sql`
      SELECT
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', oi.menu_item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${order.id}
      GROUP BY o.id
    `;

    const completeOrder = completeOrders[0];

    // Emit socket event for new order
    if (req.io) {
      req.io.emit('newOrder', completeOrder);
      req.io.to('admin').emit('newOrder', completeOrder);
    }

    res.status(201).json({ success: true, data: completeOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let orders;
    if (status) {
      orders = await sql`
        SELECT
          o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_item_id', oi.menu_item_id,
              'menu_item_name', oi.menu_item_name,
              'quantity', oi.quantity,
              'price', oi.price,
              'subtotal', oi.subtotal
            )
          ) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = ${status}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
    } else {
      orders = await sql`
        SELECT
          o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_item_id', oi.menu_item_id,
              'menu_item_name', oi.menu_item_name,
              'quantity', oi.quantity,
              'price', oi.price,
              'subtotal', oi.subtotal
            )
          ) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await sql`
      SELECT
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', oi.menu_item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${id}
      GROUP BY o.id
    `;

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Check if user owns this order (if not admin)
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const orders = await sql`
      SELECT
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', oi.menu_item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = ${orderNumber}
      GROUP BY o.id
    `;

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: orders[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const orders = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Fetch complete order with items
    const completeOrders = await sql`
      SELECT
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', oi.menu_item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${id}
      GROUP BY o.id
    `;

    const completeOrder = completeOrders[0];

    // Emit socket event for status update
    if (req.io) {
      req.io.to(`order_${completeOrder.order_number}`).emit('orderUpdate', { order: completeOrder });
      req.io.emit('orderStatusUpdate', { orderId: id, status, order: completeOrder });
      req.io.to('admin').emit('orderStatusUpdate', { orderId: id, status, order: completeOrder });
    }

    res.json({ success: true, data: completeOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await sql`
      SELECT
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'menu_item_name', oi.menu_item_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${req.user.id}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrdersResult = await sql`
      SELECT COUNT(*) as count FROM orders
    `;
    const totalOrders = parseInt(totalOrdersResult[0].count);

    // Get pending orders count
    const pendingOrdersResult = await sql`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `;
    const pendingOrders = parseInt(pendingOrdersResult[0].count);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await sql`
      SELECT total FROM orders
      WHERE created_at >= ${today.toISOString()}
    `;

    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Get recent orders
    const recentOrders = await sql`
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        todayRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
