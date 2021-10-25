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

  //reviso la base de datos para ver si existe un user con ese nombre
  usersCollection
    .where("playerName", "==", playerName)
    .get()
    .then((query) => {
      //si no existe crea un user nuevo
      if (query.empty) {
        usersCollection
          .add({
            playerName: playerName,
          })
          .then((userRef) => {
            res.json({
              id: userRef.id,
            });
          });
      } else {
        //si existe devuelve el id del usuario existente
        query.forEach((doc) => {
          res.json({
            id: doc.id,
          });
        });
      }
    });
});
app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((snap) => {
      res.json(snap.data());
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
            if (snap.data()) {
              const realTimeRoom = realTime.ref(
                "rooms/" + snap.data().realTimeId + "/currentGame"
              );
              realTimeRoom.get().then((doc) => {
                //chequeo si existe current game dentro del room
                if (doc.exists()) {
                  const childerns = doc.numChildren();

                  //si currentGame tiene un solo hijo (player 1)
                  //permite que se una el segundo usuario, por lo tanto duevle el id
                  if (childerns == 1) {
                    res.json({
                      realTimeId: snap.data().realTimeId,
                    });
                  } else {
                    //si tiene mas de un hijo hago referencia a un doc con id del user
                    const realTimeRoomUser = realTime.ref(
                      "rooms/" +
                        snap.data().realTimeId +
                        "/currentGame/" +
                        userId
                    );
                    realTimeRoomUser.get().then((doc) => {
                      //si el doc existe el jugador estuvo unido previamente al room y lo deja entrar devolviendo el id
                      if (doc.exists()) {
                        console.log("eres de la sala");

                        res.json({
                          realTimeId: snap.data().realTimeId,
                        });
                      } else {
                        res.json({
                          message: "no perteneces a la sala",
                        });
                      }
                    });
                  }
                } else {
                  //si currentGame no existe, devuelvo el id, ya que se trata de una sala recien creada
                  res.json({
                    realTimeId: snap.data().realTimeId,
                  });
                }
              });
            } else {
              res.json({
                message: "el room no existe",
              });
            }
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
          });
      } else {
        res.status(404).json({
          message: "user doesn't exist",
        });
      }
    });
});
app.post("/rooms/:roomId/history", (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  const { game } = req.body;
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
              "rooms/" + rtdbRoomId + "/currentGame/history"
            );
            room.push(game).then(() => {
              room.get().then((data) => {
                roomsCollection
                  .doc(roomId)
                  .update({
                    history: data.val(),
                  })
                  .then(() => {
                    res.json({
                      message: "history setted",
                    });
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

app.get("/rooms/:roomId/history", (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.query;
  usersCollection
    .doc(userId.toString())
    .get()
    .then((snap) => {
      if (snap.exists) {
        roomsCollection
          .doc(roomId)
          .get()
          .then((snap) => {
            if (snap.data()) {
              if (snap.data().history) {
                res.json(snap.data().history);
              } else {
                res.status(404);
              }
            }
          });
      } else {
        res.status(404);
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
