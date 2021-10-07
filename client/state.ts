import { join } from "path/posix";
import { callbackify } from "util";
import { API_BASE_URL, rtdb } from "./front-database";
import map from "lodash/map";

type Jugada = "piedra" | "papel" | "tijera";
const state = {
  data: {
    currentGame: {
      myMove: "",
      playerTwoMove: "tijera",
    },
    gameData: {},
    playerName: "",
  },
  listeners: [],
  getState() {
    return this.data;
  },
  setState(newState) {
    console.log("soy el state he cambiado: ", newState);
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
  },
  subscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
  setMove(move: Jugada) {
    const currentState = this.getState();
    currentState.currentGame.myMove = move;
    this.setState(currentState);
  },
  //calcula quien gano la partida. 0 para pc, 1 para player y 2 para empate
  whoWins(myMove: Jugada, playerTwoMove: Jugada) {
    let winner = 0;
    const jugadasGanadoras = [
      { myMove: "piedra", playerTwoMove: "tijera" },
      { myMove: "papel", playerTwoMove: "piedra" },
      { myMove: "tijera", playerTwoMove: "papel" },
    ];
    for (const j of jugadasGanadoras) {
      if (j.myMove == myMove && j.playerTwoMove == playerTwoMove) {
        winner = 1;
      }
    }
    if (myMove == playerTwoMove) {
      winner = 2;
    }
    return winner;
  },
  setPlayerName(playerName: string) {
    const currentState = state.getState();
    currentState.playerName = playerName;
    state.setState(currentState);
  },
  createUser(callback?) {
    const currentState = state.getState();
    fetch(API_BASE_URL + "/login", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        playerName: currentState.playerName,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const currentState = state.getState();
        currentState.userId = data.id;
        state.setState(currentState);
        if (callback) {
          callback();
        }
      });
  },
  createAndJoinRoom(callback?) {
    const currentState = state.getState();

    fetch(API_BASE_URL + "/rooms", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: currentState.userId,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        currentState.roomId = data.id;
        state.setState(currentState);
        state.joinRoom();
        state.setPlayerOnline();
      });
  },
  joinRoom() {
    const currentState = state.getState();
    fetch(
      API_BASE_URL +
        "/rooms/" +
        currentState.roomId +
        "?userId=" +
        currentState.userId
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        currentState.realTimeId = data.realTimeId;
        state.setState(currentState);
        console.log("me uni al room: " + data.realTimeId);
        state.listenToRoom();
      });
  },
  setPlayerOnline() {
    const currentState = state.getState();

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/online", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        playerName: currentState.playerName,
        userId: currentState.userId,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
      });
  },
  listenToRoom() {
    const currentState = this.getState();

    if (currentState.realTimeId) {
      const chatRoomRef = rtdb.ref(
        "/rooms/" + currentState.realTimeId + "/currentGame"
      );

      chatRoomRef.on("value", (snap) => {
        if (snap.val()) {
          const gameData = snap.val();
          this.setGameData(gameData);
        }
      });
    } else {
      console.error("no se encontro el room");
    }
  },
  setGameData(gameData) {
    const currentState = state.getState();
    const gameDataMapped = map(gameData);
    for (const player of gameDataMapped) {
      if (player.userId == currentState.userId) {
        currentState.gameData.playerOne = player;
      } else {
        currentState.gameData.playerTwo = player;
      }
    }
    console.log("nueva data de juego ", currentState.gameData);

    state.setState(currentState);
  },
  setPlayerReady() {
    const currentState = state.getState();

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/ready", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roomId: currentState.roomId,
        userId: currentState.userId,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
      });
  },
};
export { state };
