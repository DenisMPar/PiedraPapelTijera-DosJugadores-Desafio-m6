customElements.define(
  "my-score-bar",
  class ScoreBar extends HTMLElement {
    shadow: ShadowRoot;
    roomId: string;
    playerOne: string;
    playerTwo: string;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const scoreBarEl = document.createElement("div");
      scoreBarEl.classList.add("score-bar");
      scoreBarEl.innerHTML = `
      <div class = "room-data__container-score">
      <my-text type = "text" class="score__player-one">Jugador 1: 5</my-text>
      <my-text type = "text" class="score__player-two">Jugador 2: 0</my-text>
      </div>
      <div class = "room-data__container-room-code">
      <my-text type = "text" class="room-code__room">Sala</my-text>
      <my-text type = "text" class="room-code__code">75KD4</my-text>
      `;

      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;

      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(scoreBarEl);
    }
  }
);
