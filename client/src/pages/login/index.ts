import { Router } from "@vaadin/router";

customElements.define(
  "login-page",
  class Login extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    roomId: string;
    connectedCallback() {
      this.render();
      const formEl = this.shadow.querySelector(".main__form");
      const shadowFormEl = formEl.shadowRoot.querySelector("form");
      // this.roomId = "ha582";

      if (this.roomId) {
        shadowFormEl.addEventListener("submit", (e) => {
          e.preventDefault();

          Router.go("/lobby");
        });
      } else {
        shadowFormEl.addEventListener("submit", (e) => {
          e.preventDefault();

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
