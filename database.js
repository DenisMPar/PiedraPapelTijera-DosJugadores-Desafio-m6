"use strict";
exports.__esModule = true;
exports.realTime = exports.firestore = void 0;
var admin = require("firebase-admin");
var serviceKey = require("./account-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceKey),
    databaseURL: "https://desafiom6-default-rtdb.firebaseio.com"
});
var firestore = admin.firestore();
exports.firestore = firestore;
var realTime = admin.database();
exports.realTime = realTime;
