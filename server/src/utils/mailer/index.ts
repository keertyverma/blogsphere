import "dotenv/config";
import ejs from "ejs";
import FormData from "form-data";
import Mailgun, { MailgunMessageData } from "mailgun.js";
import path from "path";
import { getFormattedExpiryDate } from "..";
import { MailOptions } from "../../types";

const getMailgunConfig = () => {
  return {
    domain: process.env.MAILGUN_DOMAIN || "",
    apiKey: process.env.MAILGUN_ACCOUNT_API_KEY || "",
    emailFrom: process.env.MAILGUN_EMAIL_FROM || "",
    baseUrl: process.env.MAILGUN_BASE_URL || "https://api.mailgun.net",
  };
};

// To render EJS template
export const renderTemplate = (
  templateName: string,
  data: Record<string, string>
): Promise<string> => {
  const templatesPath = path.join(__dirname, "templates");
  const filePath = path.join(templatesPath, templateName);
  return ejs.renderFile(filePath, data);
};

export const sendEmail = (options: MailOptions) => {
  if (process.env.NODE_ENV === "test") {
    console.log(`Email to ${options.to} not sent. This is a test environment.`);
    return;
  }

  const { baseUrl, apiKey, domain, emailFrom } = getMailgunConfig();

  // Initialize Mailgun client
  const mailgun = new Mailgun(FormData).client({
    username: "api",
    url: baseUrl,
    key: apiKey,
  });

  const mailOptions: MailgunMessageData = {
    from: emailFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  return mailgun.messages.create(domain, mailOptions);
};

export const sendVerificationEmail = async (
  to: string,
  token: string,
  expiresAt: Date
) => {
  // generate verification link
  const verificationLink = `${process.env.EMAIL_VERIFICATION_LINK_BASE_URL}?email=${to}&token=${token}`;
  const formattedExpiresAt = getFormattedExpiryDate(expiresAt);
  const htmlTemplate = await renderTemplate("emailVerification.ejs", {
    verificationLink: verificationLink,
    tokenExpiresAt: formattedExpiresAt,
  });

  const emailOptions: MailOptions = {
    to,
    subject: "Account Verification",
    text: `Welcome to Blogsphere👋. \n Please verify your email by clicking the following link: ${verificationLink}`,
    html: htmlTemplate,
  };

  await sendEmail(emailOptions);
};

export const sendResetPasswordEmail = async (
  to: string,
  token: string,
  expiresAt: Date
) => {
  // generate reset password link
  const resetPasswordLink = `${process.env.EMAIL_RESET_PASSWORD_LINK_BASE_URL}?email=${to}&token=${token}`;
  const formattedExpiresAt = getFormattedExpiryDate(expiresAt);
  const htmlTemplate = await renderTemplate("resetPassword.ejs", {
    resetPasswordLink: resetPasswordLink,
    tokenExpiresAt: formattedExpiresAt,
  });

  const emailOptions: MailOptions = {
    to,
    subject: "Reset password for Blogsphere account.",
    text: `Password Reset Request. \n Please reset your password by clicking the following link: ${resetPasswordLink}`,
    html: htmlTemplate,
  };

  await sendEmail(emailOptions);
};
