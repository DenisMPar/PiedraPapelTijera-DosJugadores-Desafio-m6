import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "lobby-page",
  class Lobby extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    playerTwoName: string = "player";
    playerTwoReady: boolean = false;
    check: boolean;
    gameData;
    connectedCallback() {
      const currentState = state.getState();
      this.gameData = currentState.gameData;
      this.check = false;
      this.render();
      state.subscribe(() => {
        const currentState = state.getState();
        this.gameData = currentState.gameData;
        this.getPlayerTwoName();
        this.checkPlayerReady();
        this.render();
      });
      const buttonEl = this.shadow.querySelector(".main__new-game-button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault();
        state.setPlayerReady(true);
        this.check = true;
        if (this.playerTwoReady) {
          Router.go("/game");
          this.check = false;
        }
      });
    }
    getPlayerTwoName() {
      if (this.gameData) {
        if (this.gameData.playerTwo) {
          const playerTwoData = this.gameData.playerTwo;
          if (playerTwoData.playerName) {
            this.playerTwoName = playerTwoData.playerName;
            if (this.check) {
              const mainEl = this.shadow.querySelector(".main");
              mainEl.innerHTML = `
              <my-text type = "text" class="main__text">Esperando a que ${this.playerTwoName} presione jugar
              </my-text>
              `;
            }
          }
        }
      }
    }
    checkPlayerReady() {
      if (this.gameData.playerTwo) {
        const playerTwoData = this.gameData.playerTwo;
        if (playerTwoData.ready) {
          this.playerTwoReady = playerTwoData.ready;
          if (this.check) {
            console.log("checked");
            Router.go("/game");
            this.check = false;
          }
        }
      }
    }

    render() {
      const containerEl = document.createElement("div");
      containerEl.classList.add("page-container");
      containerEl.innerHTML = `
      <my-score-bar class="score-bar"></my-score-bar>
      <main class="main">
      <div class = "main__container-text">
      <my-text type = "text" class="main__text">Presioná jugar
      y elegí: piedra, papel o tijera antes de que pasen los 3 segundos o perderás el juego.
      </my-text>
      </div>
      <div class = "main__container-button">
      <my-button class="main__new-game-button">Jugar</my-button>
      </div>
      </main>
      <my-footer class="footer"></my-footer>
      `;

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
