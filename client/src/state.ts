type Jugada = "piedra" | "papel" | "tijera";
const state = {
  data: {
    currentGame: {
      myMove: "",
      playerTwoMove: "tijera",
    },
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
};

export { state };
