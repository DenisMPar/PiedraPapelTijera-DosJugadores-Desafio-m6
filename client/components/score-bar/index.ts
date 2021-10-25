import { state } from "../../state";

customElements.define(
  "my-score-bar",
  class ScoreBar extends HTMLElement {
    shadow: ShadowRoot;
    roomId: string = "";
    playerOne: string = "";
    playerTwo: string = "";
    score = {
      playerOne: 0,
      playerTwo: 0,
    };

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.score = state.historyResults();
      this.render();
      this.showRoomId();
      state.subscribe(() => {
        this.score = state.historyResults();
        this.getPlayersName();
        this.showPlayersScore();
        this.showRoomId();
      });
    }
    //actualiza los nombres de los jugadores en el componente
    getPlayersName() {
      const currentState = state.getState();
      if (currentState.roomId) {
        this.roomId = currentState.roomId;
      }
      if (currentState.gameData) {
        if (currentState.gameData.playerTwo) {
          const playerTwoData = currentState.gameData.playerTwo;
          if (playerTwoData.playerName) {
            this.playerTwo = playerTwoData.playerName;
          }
        }
        if (currentState.gameData.playerOne) {
          const playerOneData = currentState.gameData.playerOne;
          if (playerOneData.playerName) {
            this.playerOne = playerOneData.playerName;
          }
        }
      }
    }

    showPlayersScore() {
      const containerScore = this.shadow.querySelector(
        ".room-data__container-score"
      );
      containerScore.innerHTML = `
      <my-text type = "text" class="score__player-one">${this.playerOne}: ${this.score.playerOne}</my-text>
      <my-text type = "text" class="score__player-two">${this.playerTwo}: ${this.score.playerTwo}</my-text>
      `;
    }
    showRoomId() {
      const containerId = this.shadow.querySelector(
        ".room-data__container-room-code"
      );
      containerId.innerHTML = `
      <my-text type = "text" class="room-code__room">Sala</my-text>
      <my-text type = "text" class="room-code__code">${this.roomId}</my-text>
      `;
    }
    render() {
      const scoreBarEl = document.createElement("div");
      scoreBarEl.classList.add("score-bar");
      scoreBarEl.innerHTML = `
      <div class = "room-data__container-score">
      </div>
      <div class = "room-data__container-room-code">
      </div>
      `;

      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;

      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(scoreBarEl);
      this.getPlayersName();
      this.showPlayersScore();
    }
  }
);
