// /api/send-inquiry.js - Vercel Serverless Function
// Put this file in your repo at /api/send-inquiry.js
// It keeps cisnerosstadiumclub@gmail.com hidden in an env variable

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, team, date, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // RECIPIENT_EMAIL is set in Vercel Dashboard -> Settings -> Environment Variables
  // Value: cisnerosstadiumclub@gmail.com - never exposed to frontend
  const recipient = process.env.RECIPIENT_EMAIL;

  if (!recipient) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    // Using Gmail SMTP - you need a Gmail App Password
    // Go to myaccount.google.com -> Security -> 2-Step Verification -> App Passwords
    // Create app password for "Mail" and use it as GMAIL_APP_PASSWORD env variable
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // cisnerosstadiumclub@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // 16-char app password, not your login password
      },
    });

    const mailOptions = {
      from: `"Cisneros Photography Site" <${process.env.GMAIL_USER}>`,
      to: recipient,
      replyTo: email,
      subject: `New Booking: ${service} - ${name} (${team || 'No team'})`,
      html: `
        <div style="font-family: sans-serif; background: #08080a; color: #f5f5f5; padding: 24px; border-radius: 12px;">
          <h2 style="color: #ff4d00; margin: 0 0 16px;">New Inquiry - Cisneros Photography</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Team:</strong> ${team || 'N/A'}</p>
          <p><strong>Date:</strong> ${date || 'N/A'}</p>
          <p><strong>Service:</strong> ${service}</p>
          <hr style="border-color: #222; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #111; padding: 12px; border-radius: 8px;">${message}</p>
          <p style="margin-top: 20px; font-size: 11px; color: #888;">Sent from cisnerosstadiumclub.com contact form</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
