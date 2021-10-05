customElements.define(
  "result-win-page",
  class ResultWin extends HTMLElement {
    shadow: ShadowRoot;
    score = {
      computer: 1,
      player: 0,
    };
    connectedCallback() {
      this.shadow = this.attachShadow({ mode: "open" });
      this.render();
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
      <my-score computer="${this.score.computer}" player="${this.score.player}"></my-score>
      </div>
      <div class="result__container-button">
      <my-button>Volver a jugar</my-button>
      </div>
      </main>
      `;
      const buttonEl = containerEl.querySelector("my-button");
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault;
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
