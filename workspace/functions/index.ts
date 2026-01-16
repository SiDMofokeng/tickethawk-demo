import * as functions from "firebase-functions";
import * as express from "express";
// import * as admin from "firebase-admin";

// // Safely initialize the Firebase Admin SDK
// if (admin.apps.length === 0) {
//   try {
//     admin.initializeApp();
//   } catch (error) {
//     console.error("Firebase admin initialization error:", error);
//   }
// }
// const db = admin.firestore();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "tickethawk-xhm8nieu52";

// Handles webhook verification (GET requests)
app.get("/webhook", (req, res) => {
  console.log("Received verification request.");

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(`- Mode: ${mode}`);
  console.log(`- Token: ${token}`);
  console.log(`- Challenge: ${challenge}`);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully.");
    res.status(200).send(challenge);
  } else {
    console.error("Webhook verification failed. Token or mode mismatch.");
    res.sendStatus(403);
  }
});

// Handles incoming messages (POST requests)
app.post("/webhook", async (req, res) => {
  console.log("Received incoming message payload:");
  console.log(JSON.stringify(req.body, null, 2));

    // const entry = req.body.entry?.[0];
    // const change = entry?.changes?.[0];
    // const message = change?.value?.messages?.[0];

    // if (message) {
    //   const from = message.from; // Sender phone number
    //   const name = change.value.contacts?.[0]?.profile?.name || "Unknown";
    //   const text = message.text?.body;

    //   if (from && text) {
    //     console.log(`Processing message from ${name} (${from}): "${text}"`);
        
    //     // Store the message in Firestore
    //     await db.collection("whatsapp_messages").add({
    //       from,
    //       name,
    //       text,
    //       timestamp: admin.firestore.FieldValue.serverTimestamp(),
    //     });

    //     console.log("Message successfully stored in Firestore.");
    //   }
    // }

  res.status(200).send("EVENT_RECEIVED");
});


// Expose the express app as a single Cloud Function.
// The function name will be 'webhook', so the URL will end in /webhook
export const webhook = functions.https.onRequest(app);
