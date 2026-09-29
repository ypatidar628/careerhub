import nodemailer from "nodemailer";

let transporter = null;

const createTransporter = async () => {
  // Normalize environment variables
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").trim().replace(/^["']|["']$/g, "");
  const smtpHost = (process.env.SMTP_HOST || "").trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const emailService = (process.env.EMAIL_SERVICE || "").trim().toLowerCase();

  // 1. If user is Gmail or EMAIL_SERVICE is gmail, use Gmail service directly
  if (emailUser && emailPass && (emailUser.endsWith("@gmail.com") || emailService === "gmail")) {
    console.log(`[MailService] Initializing Gmail SMTP transport for: ${emailUser}`);
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // 2. If custom SMTP host is provided
  if (smtpHost && emailUser && emailPass) {
    console.log(`[MailService] Initializing custom SMTP transport on ${smtpHost}:${smtpPort}`);
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // 3. Fallback: Ethereal test SMTP account for local development
  try {
    console.log("[MailService] No real email credentials found. Creating Ethereal test mailbox...");
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn("[MailService] Could not create Ethereal test account, will log to console:", err.message);
    return null;
  }
};

/**
 * Generates an email HTML template styled with CareerHub brand colors & clean card layout
 */
const generateEmailHtml = (otpCode, purpose = "registration") => {
  const isReset = purpose === "reset";
  const actionTitle = isReset ? "Password Reset Request" : "Account Verification";
  const actionSubtitle = isReset
    ? "We received a request to reset your CareerHub account password."
    : "Thank you for creating an account with CareerHub! To finalize your registration, please verify your email address.";

  // Split OTP into separate styled digit blocks
  const digits = String(otpCode).split("");
  const digitBoxes = digits
    .map(
      (d) => `
        <td style="padding: 0 4px;">
          <div style="
            display: inline-block;
            width: 44px;
            height: 52px;
            line-height: 52px;
            background: #ffffff;
            border: 2px solid #dedee2;
            border-radius: 12px;
            color: #50357f;
            font-size: 28px;
            font-weight: 800;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            text-align: center;
            box-shadow: 0 2px 6px rgba(80, 53, 127, 0.08);
          ">${d}</div>
        </td>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actionTitle} - CareerHub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e2e8f0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(21, 20, 56, 0.15); border: 1px solid #cbd5e1;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Gradient Top Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #232050 0%, #1c1946 50%, #151438 100%); padding: 36px 32px 32px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Brand Monogram -->
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.12); padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2); margin-bottom: 12px;">
                      <span style="color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ✦ CAREERHUB
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 8px 0 0 0; letter-spacing: -0.5px;">
                      ${actionTitle}
                    </h1>
                    <p style="color: #cbd5e1; font-size: 13px; margin: 8px 0 0 0; max-width: 400px; line-height: 1.5;">
                      One-time security verification passcode
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello,
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 28px 0;">
                ${actionSubtitle}
              </p>

              <!-- OTP Passcode Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 14px;">
                      Your Verification Code
                    </div>

                    <!-- Digit Blocks -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        ${digitBoxes}
                      </tr>
                    </table>

                    <!-- Expiration Alert Banner -->
                    <div style="margin-top: 20px; display: inline-block; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 6px 14px; border-radius: 20px;">
                      <span style="color: #e11d48; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">
                        ⏱ Expires in 30 seconds
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Instructions / Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px; line-height: 1.3;">
                          🔒
                        </td>
                        <td style="padding-left: 8px;">
                          <p style="color: #475569; font-size: 12px; line-height: 1.5; margin: 0;">
                            <strong>Security reminder:</strong> CareerHub will never ask for your verification code or password over phone or email. Never share this code with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 6px 0;">
                If you did not request this OTP, you can safely disregard this email or report unauthorized activity to our security team.
              </p>
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center; background-color: #fafafa;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0; font-weight: 500;">
                © 2026 CareerHub, Inc. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
                This automated security transmission was sent to your registered email address.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const sendOtpEmail = async (toEmail, otpCode, purpose = "registration") => {
  try {
    if (!transporter) {
      transporter = await createTransporter();
    }

    const isReset = purpose === "reset";
    const subject = `${otpCode} is your CareerHub verification code (Expires in 30s)`;
    const htmlContent = generateEmailHtml(otpCode, purpose);

    if (transporter) {
      const fromEmail =
        (process.env.EMAIL_USER || process.env.SMTP_USER || "dev843381@gmail.com").trim();
      const fromAddress =
        process.env.EMAIL_FROM || `"CareerHub Security" <${fromEmail}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      console.log(`[MailService] OTP email sent to ${toEmail}. Message ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[MailService] Ethereal Email Preview URL: ${previewUrl}`);
      }
      return { success: true, previewUrl, messageId: info.messageId };
    }

    console.log(`[MailService] Transporter not available. OTP for ${toEmail}: ${otpCode}`);
    return { success: true, fallback: true };
  } catch (error) {
    console.error(`[MailService] Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};
