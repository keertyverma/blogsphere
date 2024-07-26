import "dotenv/config";
import FormData from "form-data";
import Mailgun, { MailgunMessageData } from "mailgun.js";
import { MailOptions } from "../../types";
import ejs from "ejs";
import path from "path";

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
