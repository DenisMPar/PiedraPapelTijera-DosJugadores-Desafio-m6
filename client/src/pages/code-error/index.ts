customElements.define(
  "code-error-page",
  class CodeError extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
    }
    render() {
      const mainEl = document.createElement("main");
      mainEl.classList.add("main");
      mainEl.innerHTML = `
        <div class = "main__container-title">
        <my-text type = "title" class="main__title">Piedra Papel o Tijera</my-text>
        </div>
        <div class = "main__container-text">
        <my-text type = "text" class="main__text">Ups, tu código no coincide con ninguna sala.</my-text>
        </div>
        <div class = "main__container-icons">
        <my-play type="piedra"></my-play>
        <my-play type="papel"></my-play>
        <my-play type="tijera"></my-play>
        </div>
        `;

      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;
      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(mainEl);
    }
  }
);
