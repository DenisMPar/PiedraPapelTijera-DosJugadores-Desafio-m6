import { Router } from "@vaadin/router";
import { state } from "../../state";

customElements.define(
  "login-page",
  class Login extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    joinRoom: boolean;
    connectedCallback() {
      const currentState = state.getState();
      this.joinRoom = currentState.joinRoom;
      this.render();
      this.addRoutes();
    }
    //agrega el redireccionamiento de acuerdo al estado de joinroom, para saber si
    //crear una nueva sala o unirse a una existente
    addRoutes() {
      const formEl = this.shadow.querySelector(".main__form");
      const shadowFormEl = formEl.shadowRoot.querySelector("form");

      if (this.joinRoom) {
        shadowFormEl.addEventListener("submit", (e) => {
          e.preventDefault();
          const target = e.target as any;
          state.setPlayerName(target.input.value);
          state.createUser();
          Router.go("/join-room");
        });
      } else {
        shadowFormEl.addEventListener("submit", (e) => {
          e.preventDefault();
          const target = e.target as any;
          state.setPlayerName(target.input.value);
          state.createUser(state.createAndJoinRoom);
          Router.go("/room-code");
        });
      }
    }

    render() {
      const containerEl = document.createElement("div");

      containerEl.classList.add("page-container");

      containerEl.innerHTML = `
      <main class ="main">
      <div class = "main__container-title">
      <my-text type = "title" class="main__title">Piedra Papel o Tijera</my-text>
      </div>
      <div class = "main__container-form">
      <my-form label="Tu nombre:" button="empezar" class="main__form"></my-form>
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
