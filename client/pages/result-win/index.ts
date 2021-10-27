import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "result-win-page",
  class ResultWin extends HTMLElement {
    shadow: ShadowRoot;
    playerOneName: string = "";
    playerTwoName: string = "";
    gameData;
    score = {
      playerOne: 0,
      playerTwo: 0,
    };
    check: boolean = false;
    connectedCallback() {
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();

      const lastState = state.getState();
      //creo un objeto con los nombres de los jugadores y la jugada que hicieron
      const game = {
        [lastState.gameData.playerOne.playerName]:
          lastState.gameData.playerOne.playerMove,
        [lastState.gameData.playerTwo.playerName]:
          lastState.gameData.playerTwo.playerMove,
      };
      //checkeo que exista la data de las jugadas antes de setear el historial
      if (
        lastState.gameData.playerOne.playerMove &&
        lastState.gameData.playerTwo.playerMove
      ) {
        //el auxiliar check evita que se ejecute la funcion cuando no estoy en la pagina
        if (!this.check) {
          //subo al historial las jugadas actuales
          state.setHistory(game);
          this.check = true;
        }
      }
      this.showHistory();
      state.subscribe(() => {
        this.showHistory();
      });
    }
    //funcion que recupera el nombre de los jugadores y el historial
    showHistory() {
      const lastState = state.getState();
      this.playerOneName = lastState.gameData.playerOne.playerName;
      this.playerTwoName = lastState.gameData.playerTwo.playerName;
      this.score = state.historyResults();
      const containerScoreEl = this.shadow.querySelector(
        ".result__container-score"
      );
      if (containerScoreEl) {
        containerScoreEl.innerHTML = ``;
        containerScoreEl.innerHTML = `
        <my-score playerOne ="${this.score.playerOne}" playerOneName = ${this.playerOneName} playerTwo="${this.score.playerTwo}" playerTwoName = ${this.playerTwoName} ></my-score>
        `;
      }
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
      </div>
      <div class="result__container-button">
      <my-button>Volver a jugar</my-button>
      </div>
      </main>
      `;
      const buttonEl = containerEl.querySelector("my-button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault;
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
