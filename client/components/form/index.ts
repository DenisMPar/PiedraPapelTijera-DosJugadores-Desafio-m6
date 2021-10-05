customElements.define(
  "my-form",
  class Form extends HTMLElement {
    shadow: ShadowRoot;
    label: string;
    input: string;
    button: string;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.label = this.getAttribute("label") || "";
      this.input = this.getAttribute("input") || "";
      this.button = this.getAttribute("button") || "";
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;
      const formEl = document.createElement("form");
      formEl.classList.add("form");
      formEl.innerHTML = `
      <div class="form__container-input">
      <label class="label">
      ${this.label}
      </label>
      <input type="text" placeholder="${this.input}" class="input" name="input">
      </div>
      <button class="button">${this.button}</button>
      `;
      this.shadow.appendChild(linkEl);
      this.shadow.appendChild(formEl);
    }
  }
);
