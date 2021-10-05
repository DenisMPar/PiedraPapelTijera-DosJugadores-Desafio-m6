customElements.define(
  "room-full-page",
  class RoomFull extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
    }
    render() {
      const containerEl = document.createElement("div");
      containerEl.classList.add("page-container");
      containerEl.innerHTML = `
      <main class = "main">
      <div class = "main__container-title">
      <my-text type = "title" class="main__title">Piedra Papel o Tijera</my-text>
      </div>
      <div class = "main__container-text">
      <my-text type = "text" class="main__text">Ups, esta sala está completa y tu nombre no coincide con nadie en la sala.</my-text>
      </div>
      </main>
        <my-footer class="footer"></my-footer>
        `;

      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;
      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(containerEl);
    }
  }
);
