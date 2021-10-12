import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "result-win-page",
  class ResultWin extends HTMLElement {
    shadow: ShadowRoot;
    playerOneName: string = "";
    playerTwoName: string = "";
    score = {
      playerOne: 0,
      playerTwo: 0,
    };
    connectedCallback() {
      this.shadow = this.attachShadow({ mode: "open" });
      const lastState = state.getState();
      const game = {
        playerOneMove: lastState.gameData.playerOne.playerMove,
        playerTwoMove: lastState.gameData.playerTwo.playerMove,
      };
      console.log("spy el juego", game);

      state.setHistory(game);
      this.showHistory();
      state.resetGameData();
      this.render();
    }
    showHistory() {
      const lastState = state.getState();
      this.playerOneName = lastState.gameData.playerOne.playerName;
      this.playerTwoName = lastState.gameData.playerTwo.playerName;
      this.score = state.historyResults();
    }
    render() {
      const containerEl = document.createElement("div");
      containerEl.innerHTML = `
      <main class ="main">
      <div class="result-win__background">
      </div>  
      <div class="result__container-result">
      <my-result type="win">Ganaste</my-result>
      </div>
      <div class="result__container-score">
      <my-score playerOne ="${this.score.playerOne}" playerOneName = ${this.playerOneName} playerTwo="${this.score.playerTwo}" playerTwoName = ${this.playerTwoName} ></my-score>
      </div>
      <div class="result__container-button">
      <my-button>Volver a jugar</my-button>
      </div>
      </main>
      `;
      const buttonEl = containerEl.querySelector("my-button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault;
        console.log("click");

        Router.go("/lobby");
      });
      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;
      const shadowHead = document.createElement("head");

      shadowHead.appendChild(linkEl);
      this.shadow.appendChild(shadowHead);
      this.shadow.appendChild(containerEl);
    }
  }
);
