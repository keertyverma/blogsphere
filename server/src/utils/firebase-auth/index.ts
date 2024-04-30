import admin from "firebase-admin";
import config from "config";

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
  const firebaseConfig = getFirebaseConfig();

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
};
