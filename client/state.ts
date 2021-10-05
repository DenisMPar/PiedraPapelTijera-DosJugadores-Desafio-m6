import { join } from "path/posix";
import { API_BASE_URL } from "./front-database";

type Jugada = "piedra" | "papel" | "tijera";
const state = {
  data: {
    currentGame: {
      myMove: "",
      playerTwoMove: "tijera",
    },
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
      console.log("se ejecvuto el listener");

      cb();
    }
  },
  subscribe(callback: (any) => any) {
    console.log("soy el subscirbe");
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
  createAndJoinRoom() {
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
      });
  },
  joinRoom() {
    console.log("join room");

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
      });
  },
};
export { state };
