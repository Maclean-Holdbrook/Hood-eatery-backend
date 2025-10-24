import { sendSupportEmail } from '../utils/emailService.js';

// @desc    Send support message
// @route   POST /api/support/message
// @access  Public
export const sendMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject, and message',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Send email to admin
    await sendSupportEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};
