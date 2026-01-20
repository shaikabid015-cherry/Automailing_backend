const path= require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Email API is running!' });
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, message, fromName = 'Auto Mailing System' } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, message' 
      });
    }

    // Email options
    const mailOptions = {
      from: `${fromName} <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Auto Mailing System</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This email was sent automatically from our system.</p>
            <p>© ${new Date().getFullYear()} Auto Mailing System</p>
          </div>
        </div>
      `,
      text: message // Fallback for plain text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
});

// Get email templates
app.get('/templates', (req, res) => {
  const templates = {
    welcome: {
      name: "Welcome Email",
      subject: "Welcome to Our Service!",
      message: "Hello {{name}},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team"
    },
    notification: {
      name: "Notification",
      subject: "Important Update",
      message: "Dear {{name}},\n\nThis is an important notification regarding your account.\n\nRegards,\nAdmin Team"
    },
    custom: {
      name: "Custom Email",
      subject: "",
      message: ""
    }
  };
  res.json(templates);
});
// For production - serve frontend
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});


