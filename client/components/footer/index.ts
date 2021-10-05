customElements.define(
  "my-footer",
  class Footer extends HTMLElement {
    shadow: ShadowRoot;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
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
      containerEl.innerHTML = `
        <my-play type="piedra"></my-play>
        <my-play type="papel"></my-play>
        <my-play type="tijera"></my-play>
      `;

      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(containerEl);
    }
  }
);
