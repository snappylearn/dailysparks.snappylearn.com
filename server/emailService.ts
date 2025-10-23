import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return false;
    }

    await transporter.sendMail({
      from: `"Daily Sparks" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

interface QuizVerificationEmailData {
  quizId: string;
  quizTitle: string;
  quizType: string;
  subject: string;
  level: string;
  totalQuestions: number;
  difficulty: string;
  adminQuizLink: string;
}

export async function sendQuizVerificationEmail(data: QuizVerificationEmailData): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Verification Required</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 20px; }
    .quiz-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #e9ecef; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #6c757d; display: inline-block; width: 150px; }
    .detail-value { color: #212529; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Quiz Awaiting Verification</h1>
    </div>
    <div class="content">
      <p>A new AI-generated quiz has been created and requires manual review before it can be used by students.</p>
      <div class="quiz-details">
        <div class="detail-row">
          <span class="detail-label">Quiz Title:</span>
          <span class="detail-value"><strong>${data.quizTitle}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Subject:</span>
          <span class="detail-value">${data.subject}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Level:</span>
          <span class="detail-value">${data.level}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quiz Type:</span>
          <span class="detail-value">${data.quizType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Questions:</span>
          <span class="detail-value">${data.totalQuestions}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Difficulty:</span>
          <span class="detail-value">${data.difficulty}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quiz ID:</span>
          <span class="detail-value"><code>${data.quizId}</code></span>
        </div>
      </div>
      <div class="alert">
        <strong>⚠️ Action Required:</strong> This quiz is marked as <strong>unverified</strong> and will not be available to students until you review and approve it.
      </div>
      <div style="text-align: center;">
        <a href="${data.adminQuizLink}" class="button">Review & Verify Quiz →</a>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
        You can review the quiz questions, edit them if needed, and mark it as verified in the admin panel.
      </p>
    </div>
    <div class="footer">
      <p>Daily Sparks Quiz Management System</p>
      <p style="font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
New Quiz Awaiting Verification

A new AI-generated quiz has been created and requires manual review.

Quiz Details:
- Title: ${data.quizTitle}
- Subject: ${data.subject}
- Level: ${data.level}
- Quiz Type: ${data.quizType}
- Total Questions: ${data.totalQuestions}
- Difficulty: ${data.difficulty}
- Quiz ID: ${data.quizId}

Action Required:
This quiz is marked as unverified and will not be available to students until you review and approve it.

Review Link: ${data.adminQuizLink}

---
Daily Sparks Quiz Management System
  `;

  try {
    const success = await sendEmail({
      to: 'modernmindsgroup@gmail.com',
      subject: `🎯 Quiz Verification Required: ${data.quizTitle}`,
      html: htmlContent,
      text: textContent,
    });
    
    if (success) {
      console.log('✅ Quiz verification email sent successfully');
    }
    return success;
  } catch (error) {
    console.error('❌ Failed to send quiz verification email:', error);
    return false;
  }
}

export function generatePasswordResetEmail(resetToken: string, userEmail: string) {
  // Use production URL for password reset links
  const baseUrl = 'https://dailysparkssnappylearncom.replit.app';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Reset Your Daily Sparks Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Daily Sparks</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello,</p>
            <p>You requested to reset your password for your Daily Sparks account. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The Daily Sparks Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${userEmail}</p>
            <p>Daily Sparks - AI-Powered Revision Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your Daily Sparks Password
      
      Hello,
      
      You requested to reset your password for your Daily Sparks account.
      
      Click this link to reset your password: ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, you can safely ignore this email.
      
      Best regards,
      The Daily Sparks Team
    `
  };
}