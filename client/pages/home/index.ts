import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "home-page",
  class Home extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
      const newGameButtonEl = this.shadow.querySelector(
        ".main__new-game-button"
      );
      newGameButtonEl.addEventListener("click", (e) => {
        e.preventDefault();
        Router.go("/login");
      });
      const joinGameButtonEl = this.shadow.querySelector(
        ".main__join-game-button"
      );
      joinGameButtonEl.addEventListener("click", (e) => {
        e.preventDefault();
        const currentState = state.getState();
        currentState.joinRoom = true;
        state.setState(currentState);
        Router.go("/login");
      });
    }
    render() {
      const containerEl = document.createElement("div");
      containerEl.classList.add("page-container");
      containerEl.innerHTML = `
      <main class="main">
         <div class = "main__container-title">
            <my-text type = "title" class="main__title">Piedra Papel o Tijera</my-text>
         </div>
         <div class = "main__container-buttons">
            <my-button class="main__new-game-button">Nuevo Juego</my-button>
            <my-button class="main__join-game-button">Unirse</my-button>
         </div>
      </main>
     
         <my-footer class = "footer"></my-footer>
      
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
