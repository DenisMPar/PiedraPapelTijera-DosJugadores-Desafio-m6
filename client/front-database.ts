import firebase from "firebase";
const API_BASE_URL = "https://piedra-papel-tijera-app.herokuapp.com";

const app = firebase.initializeApp({
  apiKey: process.env.API_KEY_RTDB,
  authDomain: "desafiom6.firebaseapp.com",
  databaseURL: "https://desafiom6-default-rtdb.firebaseio.com/",
  projectId: "desafiom6",
});
const rtdb = firebase.database();

export { rtdb, API_BASE_URL };
