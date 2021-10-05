customElements.define(
  "my-text",
  class Text extends HTMLElement {
    shadow: ShadowRoot;
    type: String;
    text: string;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.type = this.getAttribute("type" || "text");
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
      this.shadow.appendChild(linkEl);

      if (this.type === "text") {
        const textEl = document.createElement("p");
        textEl.className = "text";
        textEl.textContent = this.text;
        this.shadow.appendChild(textEl);
      }
      if (this.type === "title") {
        const titleEl = document.createElement("h1");
        titleEl.className = "title";
        titleEl.textContent = this.text;
        this.shadow.appendChild(titleEl);
      }
    }
  }
);
