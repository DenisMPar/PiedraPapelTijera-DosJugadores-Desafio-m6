customElements.define(
  "my-score",
  class Score extends HTMLElement {
    shadow: ShadowRoot;

    playerOneScore;
    playerTwoScore;
    playerOneName;
    playerTwoName;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.playerOneScore = this.getAttribute("playerOne");
      this.playerTwoScore = this.getAttribute("playerTwo");
      this.playerOneName = this.getAttribute("playerOneName");
      this.playerTwoName = this.getAttribute("playerTwoName");
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
        <span class="result">${this.playerOneName}: ${this.playerOneScore}</span>
        <span class="result">${this.playerTwoName}: ${this.playerTwoScore}</span>
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
