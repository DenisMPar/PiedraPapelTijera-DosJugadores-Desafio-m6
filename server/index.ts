import { realTime, firestore } from "./database";
import * as express from "express";
import { nanoid } from "nanoid";
import * as cors from "cors";

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
        res.status(401).json({
          message: "user doesnt exist",
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
        res.send("usuario no valido");
      }
    });
});

//setea el estado online de un player
app.post("/rooms/:roomId/online", (req, res) => {
  const { roomId } = req.params;
  const { userName } = req.body;
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
              "rooms/" + rtdbRoomId + "/currentGame/" + userName + "/online"
            );
            room.set(true).then(() => {
              res.json({
                message: "player online",
              });
            });
          });
      } else {
        res.status(404).json({
          message: "usuario no valido",
        });
      }
    });
});

app.use(express.static("../dist"));
app.get("*", (req, res) => {
  const dir = __dirname;
  const newDir = dir.replace("server", "dist");
  res.sendFile(newDir + "\\index.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
