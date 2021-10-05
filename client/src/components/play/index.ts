const imgpiedra = require("url:../../images/piedra.svg");
const imgpapel = require("url:../../images/papel.svg");
const imgtijera = require("url:../../images/tijera.svg");

customElements.define(
  "my-play",
  class Play extends HTMLElement {
    shadow: ShadowRoot;
    type: String;
    rotate: boolean;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.type = this.getAttribute("type");
      this.rotate = this.hasAttribute("rotate");
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;

      const containerEl = document.createElement("div");
      containerEl.classList.add("container");
      const playEl = document.createElement("img");
      playEl.classList.add("play");
      //condicionales que eligen la imagen correspondiente a cada tipo de jugada
      if (this.type == "piedra") {
        playEl.src = imgpiedra;
      }
      if (this.type == "papel") {
        playEl.src = imgpapel;
      }
      if (this.type == "tijera") {
        playEl.src = imgtijera;
      }
      if (this.rotate) {
        playEl.classList.add("rotate");
      }
      containerEl.appendChild(playEl);
      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(containerEl);
    }
  }
);
