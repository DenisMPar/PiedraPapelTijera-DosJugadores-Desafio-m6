import { state } from "../../state";

customElements.define(
  "my-score-bar",
  class ScoreBar extends HTMLElement {
    shadow: ShadowRoot;
    roomId: string;
    playerOne: string = "";
    playerTwo: string = "";
    scorePlayerOne: number = 0;
    scorePlayerTwo: number = 0;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.render();
      state.subscribe(() => {
        this.getPlayersName();
        this.showPlayersScore();
      });
    }
    getPlayersName() {
      const currentState = state.getState();
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
    showPlayersScore() {
      const containerScore = this.shadow.querySelector(
        ".room-data__container-score"
      );
      containerScore.innerHTML = `
      <my-text type = "text" class="score__player-one">${this.playerOne}: ${this.scorePlayerOne}</my-text>
      <my-text type = "text" class="score__player-two">${this.playerTwo}: ${this.scorePlayerTwo}</my-text>
      `;
    }
    render() {
      const scoreBarEl = document.createElement("div");
      scoreBarEl.classList.add("score-bar");
      scoreBarEl.innerHTML = `
      <div class = "room-data__container-score">
      </div>
      <div class = "room-data__container-room-code">
      <my-text type = "text" class="room-code__room">Sala</my-text>
      <my-text type = "text" class="room-code__code">75KD4</my-text>
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
