import config from "config";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

const getFirebaseConfig = (): admin.ServiceAccount => {
  const privateKey: string = config.get(
    "firebaseGoogleAuth.privateKey"
  ) as string;
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  return {
    type: "service_account",
    project_id: config.get("firebaseGoogleAuth.projectId"),
    private_key_id: config.get("firebaseGoogleAuth.privateKeyId"),
    private_key: formattedPrivateKey,
    client_email: config.get("firebaseGoogleAuth.clientEmail"),
    client_id: config.get("firebaseGoogleAuth.clientId"),
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: config.get("firebaseGoogleAuth.clientX509CertUrl"),
    universe_domain: "googleapis.com",
  } as admin.ServiceAccount;
};

export const initializeFirebaseAuth = () => {
  // Skip Firebase initialization in test environments
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping Firebase initialization in test environment.");
    return;
  }

  const firebaseConfig = getFirebaseConfig();

  return admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
};

export const verifyIdToken = async (accessToken: string) => {
  return await getAuth().verifyIdToken(accessToken);
};
