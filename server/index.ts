import { realTime, firestore } from "./database";
import * as express from "express";
import { nanoid } from "nanoid";
import * as cors from "cors";
import * as path from "path";
import * as map from "lodash/map";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const usersCollection = firestore.collection("users");
const roomsCollection = firestore.collection("rooms");

app.post("/login", (req, res) => {
  const { playerName } = req.body;

  usersCollection
    .add({
      playerName: playerName,
    })
    .then((userRef) => {
      res.json({
        id: userRef.id,
      });
    });
});

//Crea un nuevo room verificando primero que el user id exista
app.post("/rooms", (req, res) => {
  const { userId } = req.body;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((docSnap) => {
      if (docSnap.exists) {
        //si verifica que el user existe, crea el room con un nanoid
        const newRoomRef = realTime.ref("rooms/" + nanoid());
        newRoomRef
          .set({
            currentGame: {},
            owner: userId,
          })
          .then(() => {
            //uso dos id, uno corto para mostrar en el front
            //y uno largo para hacer referencia al room en la realtimeDb
            //el id corto hace ref a un doc en la database que adentro contiene el id largo
            const roomLongId = newRoomRef.key;
            const roomId = Math.floor(1000 + Math.random() * 9999);
            roomsCollection
              .doc(roomId.toString())
              .set({
                realTimeId: roomLongId,
              })
              .then(() => {
                res.json({
                  id: roomId,
                });
              });
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});

//endpoint que devuelve el id largo de un room en la realTimeDb
//debe recibir un user id valido a traves de una query
app.get("/rooms/:id", (req, res) => {
  const { userId } = req.query;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        roomsCollection
          .doc(req.params.id.toString())
          .get()
          .then((snap) => {
            res.json(snap.data());
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});

//setea el estado online de un player
app.post("/rooms/:roomId/online", (req, res) => {
  const { roomId } = req.params;
  const { playerName } = req.body;
  const { userId } = req.body;

  usersCollection
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            const rtdbRoomId = snap.data().realTimeId;
            const room = realTime.ref(
              "rooms/" + rtdbRoomId + "/currentGame/" + userId
            );
            room
              .set({
                online: true,
                userId: userId,
                playerName: playerName,
              })
              .then(() => {
                res.json({
                  message: "player online",
                });
              });
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});

//setea el estado de listo de un jugador
app.post("/rooms/:roomId/ready", (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  const { ready } = req.body;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            const rtdbRoomId = snap.data().realTimeId;
            const room = realTime.ref(
              "rooms/" + rtdbRoomId + "/currentGame/" + userId
            );
            room
              .get()
              .then((snap) => {
                return snap.val();
              })
              .then((data) => {
                room.set({ ...data, ready }).then(() => {
                  res.json({
                    message: "player ready",
                  });
                });
              });
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});

app.post("/rooms/:roomId/move", (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  const { playerMove } = req.body;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            const rtdbRoomId = snap.data().realTimeId;
            const room = realTime.ref(
              "rooms/" + rtdbRoomId + "/currentGame/" + userId
            );
            room
              .get()
              .then((snap) => {
                return snap.val();
              })
              .then((data) => {
                room.set({ ...data, playerMove }).then(() => {
                  res.json({
                    message: "player moved",
                  });
                });
              });
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});
app.post("/rooms/:roomId/reset", (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            const rtdbRoomId = snap.data().realTimeId;
            const room = realTime.ref(
              "rooms/" + rtdbRoomId + "/currentGame/" + userId + "/ready"
            );
            room.remove().then(() => {
              const room = realTime.ref(
                "rooms/" + rtdbRoomId + "/currentGame/" + userId + "/playerMove"
              );
              room.remove().then(() => {
                res.json({
                  message: "removed",
                });
              });
            });
            // room
            //   .get()
            //   .then((snap) => {
            //     return snap.val();
            //   })
            //   .then((data) => {
            //     room.set({ ...data, playerMove }).then(() => {
            //       res.json({
            //         message: "player moved",
            //       });
            //     });
            //   });
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});

app.use(express.static("dist"));
app.get("*", (req, res) => {
  const rutaRelativa = path.resolve(__dirname, "../dist/", "index.html");
  res.sendFile(rutaRelativa);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
