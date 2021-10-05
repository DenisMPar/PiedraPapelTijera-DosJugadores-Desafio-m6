import firebase from "firebase";
const API_BASE_URL = "http://localhost:3000";

const app = firebase.initializeApp({
  //   apiKey: process.env.API_KEY_RTDB,
  apiKey: "R4bfaLEp0o3sLuAeXLbAj4tQBeRLHxsZgbmnVATH",
  authDomain: "desafiom6.firebaseapp.com",
  databaseURL: "https://desafiom6-default-rtdb.firebaseio.com/",
  projectId: "desafiom6",
});
const rtdb = firebase.database();

export { rtdb, API_BASE_URL };
