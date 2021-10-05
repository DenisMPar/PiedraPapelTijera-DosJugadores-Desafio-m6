customElements.define(
  "room-code-page",
  class RoomCode extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
      this.render();
    }
    render() {
      const containerEl = document.createElement("div");
      containerEl.classList.add("page-container");
      containerEl.innerHTML = `
         <my-score-bar class="score-bar"></my-score-bar>
         <main class="main">
         <div class = "main__container-text">
         <my-text type = "text" class="main__text">Comparti el codigo:</my-text>
         <my-text type = "text" class="main__text">758465</my-text>
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
