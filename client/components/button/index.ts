customElements.define(
  "my-button",
  class Button extends HTMLElement {
    shadow: ShadowRoot;
    text: string;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.text = this.textContent;
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;
      const buttonEl = document.createElement("button");
      buttonEl.classList.add("button");
      buttonEl.textContent = this.text;
      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(buttonEl);
    }
  }
);
