"use strict";
exports.__esModule = true;
var database_1 = require("./database");
var express = require("express");
var nanoid_1 = require("nanoid");
var cors = require("cors");
var app = express();
var port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
var usersCollection = database_1.firestore.collection("users");
var roomsCollection = database_1.firestore.collection("rooms");
app.post("/login", function (req, res) {
    var playerName = req.body.playerName;
    usersCollection
        .add({
        playerName: playerName
    })
        .then(function (userRef) {
        res.json({
            id: userRef.id
        });
    });
});
//Crea un nuevo room verificando primero que el user id exista
app.post("/rooms", function (req, res) {
    var userId = req.body.userId;
    usersCollection
        .doc(userId.toString())
        .get()
        .then(function (docSnap) {
        if (docSnap.exists) {
            //si verifica que el user existe, crea el room con un nanoid
            var newRoomRef_1 = database_1.realTime.ref("rooms/" + (0, nanoid_1.nanoid)());
            newRoomRef_1
                .set({
                currentGame: {},
                owner: userId
            })
                .then(function () {
                //uso dos id, uno corto para mostrar en el front
                //y uno largo para hacer referencia al room en la realtimeDb
                //el id corto hace ref a un doc en la database que adentro contiene el id largo
                var roomLongId = newRoomRef_1.key;
                var roomId = Math.floor(1000 + Math.random() * 9999);
                roomsCollection
                    .doc(roomId.toString())
                    .set({
                    realTimeId: roomLongId
                })
                    .then(function () {
                    res.json({
                        id: roomId
                    });
                });
            });
        }
        else {
            res.status(401).json({
                message: "user doesnt exist"
            });
        }
    });
});
//endpoint que devuelve el id largo de un room en la realTimeDb
//debe recibir un user id valido a traves de una query
app.get("/rooms/:id", function (req, res) {
    var userId = req.query.userId;
    usersCollection
        .doc(userId.toString())
        .get()
        .then(function (doc) {
        if (doc.exists) {
            roomsCollection
                .doc(req.params.id.toString())
                .get()
                .then(function (snap) {
                res.json(snap.data());
            });
        }
        else {
            res.send("usuario no valido");
        }
    });
});
//setea el estado online de un player
app.post("/rooms/:roomId/online", function (req, res) {
    var roomId = req.params.roomId;
    var userName = req.body.userName;
    var userId = req.body.userId;
    usersCollection
        .doc(userId.toString())
        .get()
        .then(function (snap) {
        if (snap.exists) {
            roomsCollection
                .doc(roomId)
                .get()
                .then(function (snap) {
                var rtdbRoomId = snap.data().realTimeId;
                var room = database_1.realTime.ref("rooms/" + rtdbRoomId + "/currentGame/" + userName + "/online");
                room.set(true).then(function () {
                    res.json({
                        message: "player online"
                    });
                });
            });
        }
        else {
            res.status(404).json({
                message: "usuario no valido"
            });
        }
    });
});
app.use(express.static("../dist"));
app.get("*", function (req, res) {
    var dir = __dirname;
    var newDir = dir.replace("server", "dist");
    res.send(newDir);
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
