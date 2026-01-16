import admin from "firebase-admin";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) throw new Error("Missing FIREBASE_PRIVATE_KEY");
  // Vercel/.env often stores newlines as \n
  return key.replace(/\\n/g, "\n");
}

export function getAdminApp() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID");
  if (!clientEmail) throw new Error("Missing FIREBASE_CLIENT_EMAIL");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: getPrivateKey(),
    }),
  });

  return admin.app();
}

export function getFirestore() {
  getAdminApp();
  return admin.firestore();
}
