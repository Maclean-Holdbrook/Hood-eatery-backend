import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Send support message to admin
export const sendSupportEmail = async (messageData) => {
  const { name, email, phone, subject, message } = messageData;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Hood Eatery <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'macleaann723@gmail.com',
      subject: `Support Message: ${subject}`,
      replyTo: email,
      html: `
        <h2>New Support Message from Hood Eatery</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><em>This message was sent from the Hood Eatery contact form.</em></p>
        <p><strong>Reply to:</strong> ${email}</p>
      `,
    });

    if (error) {
      console.error('Error sending support email:', error);
      throw new Error('Failed to send email');
    }

    console.log('Support email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending support email:', error);
    throw new Error('Failed to send email');
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData) => {
  const { customerEmail, customerName, orderNumber, items, total } = orderData;

  if (!customerEmail) {
    console.log('No email provided for order confirmation');
    return { success: false, message: 'No email provided' };
  }

  const itemsList = items
    .map((item) => `<li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`)
    .join('');

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Hood Eatery <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p>Your order has been received and is being prepared.</p>

        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>

        <h4>Items:</h4>
        <ul>
          ${itemsList}
        </ul>

        <p><strong>Total:</strong> $${total.toFixed(2)}</p>

        <p>You can track your order status using your order number: ${orderNumber}</p>

        <hr>
        <p><em>Hood Eatery - Where passion meets flavor</em></p>
      `,
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Order confirmation email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update email
export const sendOrderStatusEmail = async (orderData) => {
  const { customerEmail, customerName, orderNumber, status } = orderData;

  if (!customerEmail) {
    console.log('No email provided for order status update');
    return { success: false, message: 'No email provided' };
  }

  const statusMessages = {
    pending: 'Your order has been received and is awaiting confirmation.',
    confirmed: 'Your order has been confirmed and is being prepared.',
    preparing: 'Your delicious meal is being prepared by our chefs!',
    ready: 'Your order is ready and will be delivered soon!',
    out_for_delivery: 'Your order is on its way to you!',
    delivered: 'Your order has been delivered. Enjoy your meal!',
    cancelled: 'Your order has been cancelled.',
  };

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Hood Eatery <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Order Status Update - ${orderNumber}`,
      html: `
        <h2>Order Status Update</h2>
        <p>Hello ${customerName},</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>

        <p>${statusMessages[status] || 'Your order status has been updated.'}</p>

        <p>You can track your order status using your order number: ${orderNumber}</p>

        <hr>
        <p><em>Hood Eatery - Where passion meets flavor</em></p>
      `,
    });

    if (error) {
      console.error('Error sending order status email:', error);
      return { success: false, error: error.message };
    }

    console.log('Order status email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending order status email:', error);
    return { success: false, error: error.message };
  }
};
