import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "room-code-page",
  class RoomCode extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    roomId: number;
    gameData;
    connectedCallback() {
      this.render();
      state.subscribe(() => {
        const currentState = state.getState();
        this.roomId = currentState.roomId;
        this.gameData = currentState.gameData;
        this.showRoomId();
        this.playerTwoOnline();
      });
    }
    playerTwoOnline() {
      if (this.gameData.playerTwo) {
        const playerTwoData = this.gameData.playerTwo;
        if (playerTwoData.online) {
          Router.go("/lobby");
        }
      }
    }

    showRoomId() {
      const containerRoomIdEl = this.shadow.querySelector(
        ".main__container-room-id"
      );
      if (this.roomId) {
        containerRoomIdEl.innerHTML = `
        <my-text type = "text" class="main__text">${this.roomId}</my-text>
        `;
      }
    }
    render() {
      const containerEl = document.createElement("div");
      containerEl.classList.add("page-container");
      containerEl.innerHTML = `
         <my-score-bar class="score-bar"></my-score-bar>
         <main class="main">
         <div class = "main__container-text">
         <my-text type = "text" class="main__text">Compartí el código:</my-text>
         <div class = "main__container-room-id"></div>
         <my-text type = "text" class="main__text">Con tu contrincante</my-text>
         </div>
         </main>
        <my-footer class="footer"><my-footer>
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
