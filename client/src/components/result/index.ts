customElements.define(
  "my-result",
  class Result extends HTMLElement {
    shadow: ShadowRoot;
    text: string;
    type: String;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.text = this.textContent;
      this.type = this.getAttribute("type" || "win");
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const loseImgUrl = require("url:../../images/Star-lose.svg");
      const winImgUrl = require("url:../../images/Star-win.svg");
      const style = document.createElement("style");
      style.innerHTML = `
              *{ 
                box-sizing: border-box;
              }
               .result{
                   width:254px;
                   height:259px;
                  font-family: inherit;
                  font-size: 55px;
                  color:white;
                  display: flex;
                  align-items: center;
                  justify-content:center;
                  text-align: center;
  
               }
               .result.lose{
                  background-image:url(${loseImgUrl});
               }
               .result.win{
                  background-image:url(${winImgUrl});
               }
              `;
      const resultEl = document.createElement("div");
      resultEl.classList.add("result");
      resultEl.textContent = this.text;
      if (this.type == "lose") {
        resultEl.classList.add("lose");
      }
      if (this.type == "win") {
        resultEl.classList.add("win");
      }
      this.shadow.appendChild(resultEl);
      this.shadow.appendChild(style);
    }
  }
);
