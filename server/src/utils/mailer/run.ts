import { renderTemplate, sendEmail } from ".";
import { MailOptions } from "../../types";

const run = async () => {
  const token = "generated-verification-token";
  const verificationLink = `https://localhost:3000/api/v1/auth/verify?token=${token}`;
  const htmlTemplate = await renderTemplate("emailVerification.ejs", {
    verificationLink: verificationLink,
  });

  const emailOptions: MailOptions = {
    to: "no-reply@360verse.co",
    subject: "Account Verification",
    text: `Welcome to Blogsphere👋. \n Please verify your email by clicking the following link: ${verificationLink}`,
    html: htmlTemplate,
  };

  // send email
  try {
    const data = await sendEmail(emailOptions);
    console.log("Verification email sent successfully.");
    console.log(data);
  } catch (error) {
    console.log("Failed to send email verification mail");
    console.log("Error - ", error);
  }
};

run();
