import * as admin from "firebase-admin";

const serviceKey = require("./account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceKey as any),
  databaseURL: "https://desafiom6-default-rtdb.firebaseio.com",
});

const firestore = admin.firestore();
const realTime = admin.database();
export { firestore, realTime };
