customElements.define(
  "my-score",
  class Score extends HTMLElement {
    shadow: ShadowRoot;

    playerScore: string;
    computerScore: string;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.playerScore = this.getAttribute("player");
      this.computerScore = this.getAttribute("computer");
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const scoreEl = document.createElement("div");
      scoreEl.classList.add("score");
      scoreEl.innerHTML = `
        <h4 class="title">Score</h4>
        <div>
        <span class="result">Vos: ${this.playerScore}</span>
        <span class="result">Máquina: ${this.computerScore}</span>
        </div>
        `;
      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;

      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(scoreEl);
    }
  }
);
