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
      this.check = false;
      const currentState = state.getState();
      //pongo el auxiliar started en false para que se ejecuten las funciones del subscribe
      currentState.started = false;
      state.setState(currentState);

      state.getHistory();
      this.checkPlayerReady();
      this.render();
      state.subscribe(() => {
        const currentState = state.getState();
        this.gameData = currentState.gameData;
        if (!currentState.started) {
          this.getPlayerTwoName();
          this.checkPlayerReady();
        }
      });
      const buttonEl = this.shadow.querySelector(".main__new-game-button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault();

        state.setPlayerReady(true);

        if (this.playerTwoReady) {
          Router.go("/game");
        }
      });
    }
    //funcion que muestra la pantalla de espera cuando el otro jugador no ha apretado "jugar"
    getPlayerTwoName() {
      if (this.gameData) {
        if (this.gameData.playerTwo) {
          const playerTwoData = this.gameData.playerTwo;
          if (playerTwoData.playerName) {
            this.playerTwoName = playerTwoData.playerName;
            if (this.gameData.playerOne.ready) {
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
    //funcion que checkea si el jugador 2 esta listo para ir a la pantalla del juego
    checkPlayerReady() {
      if (this.gameData) {
        if (this.gameData.playerTwo) {
          const playerTwoData = this.gameData.playerTwo;
          if (playerTwoData.ready) {
            this.playerTwoReady = true;
            if (this.gameData.playerOne.ready) {
              Router.go("/game");
            }
          }
        }
      }
    }

    render() {
      console.log("render");

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
      const childrensEl = this.shadow.children;
      if (childrensEl) {
        for (const child of childrensEl) {
          this.shadow.removeChild(child);
        }
      }
      this.shadow.appendChild(shadowHead);
      this.shadow.appendChild(containerEl);
    }
  }
);
