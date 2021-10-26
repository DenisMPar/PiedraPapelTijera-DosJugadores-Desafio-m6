import { join } from "path/posix";
import { callbackify } from "util";
import { API_BASE_URL, rtdb } from "./front-database";
import map from "lodash/map";
import { Router } from "@vaadin/router";

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
  //carga la data desde local storage
  init() {
    const currentState = state.getState();
    const localState = localStorage.getItem("state");
    const localStateParsed = JSON.parse(localState);
    if (localState) {
      state.setState({ ...currentState, ...localStateParsed });
    }
  },

  //deuvelve el state
  getState() {
    return this.data;
  },
  //setea un nuevo state
  setState(newState) {
    console.log("soy el state he cambiado: ", newState);
    this.data = newState;
    //su hay un userID lo guardo en el local storage como state
    if (newState.userId) {
      const userId = {
        userId: newState.userId,
      };
      localStorage.setItem("state", JSON.stringify(userId));
    }

    for (const cb of this.listeners) {
      cb();
    }
  },
  subscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },

  //calcula quien gano la partida.
  //devuelve 0 si gano el jugador 2, 1 si gano el jugador 1 y 2 para empate

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

    return winner;
  },
  //setea el nombre del jugador en el state
  setPlayerName(playerName: string) {
    const currentState = state.getState();
    currentState.playerName = playerName;
    state.setState(currentState);
  },
  //hace un  fetch a la api con el id del user para recuperar su nombre
  getPlayerName() {
    const currentState = state.getState();
    fetch(API_BASE_URL + "/users/" + currentState.userId)
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        currentState.playerName = data.playerName;
        state.setState(currentState);
      });
  },
  //crea un nuevo user
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
  //crea un nuevo room y luego recupera el id largo de la misma
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
        state.joinRoom(state.setPlayerOnline);
      });
  },
  //recupera el id largo de un room
  joinRoom(callback?) {
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
        //si la api no devuelve un id redirecciona a la pagina room full
        if (!data.realTimeId) {
          Router.go("/room-full");
        }

        if (callback) {
          if (data.realTimeId) {
            callback();
          }
        }
        currentState.realTimeId = data.realTimeId;
        state.setState(currentState);
        state.listenToRoom();
      });
  },
  //setea el estado online del player en la database
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
    });
  },

  //se subscribe a los cambios del room en la realtime DB
  listenToRoom() {
    const currentState = this.getState();

    if (currentState.realTimeId) {
      const chatRoomRef = rtdb.ref(
        "/rooms/" + currentState.realTimeId + "/currentGame"
      );
      chatRoomRef.get().then((doc) => {
        if (doc.child(currentState.userId).exists) {
          chatRoomRef.on("value", (snap) => {
            if (snap.val()) {
              const gameData = snap.val();
              //setea los cambios en el room en gameData
              this.setGameData(gameData);
            }
          });
        }
      });
    } else {
      console.error("El room no existe");
    }
  },
  //guarda los datos de cada jugador en el state
  //(user id, player name, si el jugador esta online, si el jugador esta listo)
  //y guarda el historial de jugadas

  setGameData(gameData) {
    const currentState = state.getState();
    const gameDataMapped = map(gameData);
    for (const player of gameDataMapped) {
      if (player.userId == currentState.userId) {
        currentState.gameData.playerOne = player;
      }
      if (player.userId && player.userId != currentState.userId) {
        currentState.gameData.playerTwo = player;
      }
      if (!player.userId) {
        currentState.history = player;
      }
    }

    state.setState(currentState);
  },
  //setea en la database si un jugador esta listo para empezar el juego
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
    });
  },
  //guarda la jugada del usuario en la database
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
    });
  },
  //resetea la jugada que hizo cada jugador
  resetGameData() {
    const currentState = state.getState();
    console.log("reseteando");

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/reset", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roomId: currentState.roomId,
        userId: currentState.userId,
      }),
    });
  },
  //guarda las jugadas de ambos usuarios en la database
  setHistory(game) {
    const currentState = state.getState();

    fetch(API_BASE_URL + "/rooms/" + currentState.roomId + "/history", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roomId: currentState.roomId,
        userId: currentState.userId,
        game,
      }),
    });
  },
  //calcula el score de ambos jugadores a partir del historial de jugadas
  historyResults() {
    const lastState = state.getState();
    const score = {
      playerOne: 0,
      playerTwo: 0,
    };
    let playerOneName = "";
    let playerTwoName = "";
    if (lastState.gameData.playerOne) {
      playerOneName = lastState.gameData.playerOne.playerName;
    }
    if (lastState.gameData.playerTwo) {
      playerTwoName = lastState.gameData.playerTwo.playerName;
    }

    const historyMapped = map(lastState.history);

    for (const i of historyMapped) {
      const resultado = state.whoWins(i[playerOneName], i[playerTwoName]);
      if (resultado == 0) {
        score.playerTwo++;
      }
      if (resultado == 1) {
        score.playerOne++;
      }
    }
    return score;
  },
  //trea el historial de jugadas desde la database
  getHistory() {
    const currentState = state.getState();
    fetch(
      API_BASE_URL +
        "/rooms/" +
        currentState.roomId +
        "/history/?userId=" +
        currentState.userId
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const currentState = state.getState();
        currentState.history = data;
        state.setState(currentState);
      });
  },
};
export { state };
