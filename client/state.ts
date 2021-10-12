import { join } from "path/posix";
import { callbackify } from "util";
import { API_BASE_URL, rtdb } from "./front-database";
import map from "lodash/map";

type Jugada = "piedra" | "papel" | "tijera" | "nada";
type Game = {
  playerOneMove: Jugada;
  playerTwoMove: Jugada;
};
const state = {
  data: {
    currentGame: {
      myMove: "",
      playerTwoMove: "",
    },
    gameData: {},
    playerName: "",
    history: [],
  },
  listeners: [],
  getState() {
    return this.data;
  },
  setState(newState) {
    // console.log("soy el state he cambiado: ", newState);
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
  },
  subscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
  // setMove(move: Jugada) {
  //   const currentState = this.getState();
  //   currentState.currentGame.myMove = move;
  //   this.setState(currentState);
  //   this.setPlayerMove();
  // },
  //calcula quien gano la partida. 0 para pc, 1 para player y 2 para empate
  setRandom() {
    const random = Math.floor(Math.random() * (0 - 3)) + 3;
    const jugadas = [
      { random: 0, play: "piedra" },
      { random: 1, play: "papel" },
      { random: 2, play: "tijera" },
    ];
    for (const j of jugadas) {
      if (j.random == random) {
        return j.play;
      }
    }
  },
  whoWins(myMove: Jugada, playerTwoMove: Jugada) {
    let winner = 0;
    const jugadasGanadoras = [
      { myMove: "piedra", playerTwoMove: "tijera" },
      { myMove: "papel", playerTwoMove: "piedra" },
      { myMove: "tijera", playerTwoMove: "papel" },
      { myMove: "piedra", playerTwoMove: "nada" },
      { myMove: "papel", playerTwoMove: "nada" },
      { myMove: "tijera", playerTwoMove: "nada" },
    ];
    for (const j of jugadasGanadoras) {
      if (j.myMove == myMove && j.playerTwoMove == playerTwoMove) {
        winner = 1;
      }
    }
    if (myMove == playerTwoMove) {
      winner = 2;
    }
    console.log("winner", winner);

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
        // console.log("cambio la data");

        if (snap.val()) {
          const gameData = snap.val();
          //setea el movimiento del jugador 2 en el espacio currentGame
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
    // console.log("nueva data de juego ", currentState.gameData);

    state.setState(currentState);
  },
  setPlayerReady(ready: boolean) {
    const currentState = state.getState();
    console.log("player ready cambio");

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/ready", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roomId: currentState.roomId,
        userId: currentState.userId,
        ready: ready,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
      });
  },
  setPlayerMove(playerMove: Jugada) {
    const currentState = state.getState();
    console.log("jugada:", playerMove);

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/move", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roomId: currentState.roomId,
        userId: currentState.userId,
        playerMove: playerMove,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
      });
  },
  resetReady() {},
  resetGameData() {
    const currentState = state.getState();

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/reset", {
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
  setHistory(game: Game) {
    const currentState = this.getState();
    currentState.history.push(game);
    this.setState(currentState);
  },
  historyResults() {
    const lastState = state.getState();
    const score = {
      playerOne: 0,
      playerTwo: 0,
    };
    for (const i of lastState.history) {
      console.log("calculando");

      const resultado = state.whoWins(i.playerOneMove, i.playerTwoMove);
      if (resultado == 0) {
        score.playerTwo++;
      }
      if (resultado == 1) {
        score.playerOne++;
      }
    }
    return score;
  },
};
export { state };
