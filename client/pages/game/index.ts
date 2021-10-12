import { Router } from "@vaadin/router";
import { stat } from "fs";
import { state } from "../../state";
type Jugada = "piedra" | "papel" | "tijera";

customElements.define(
  "game-page",
  class Game extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    check: boolean = false;
    gameData;

    connectedCallback() {
      this.render();
      this.setClock();
      this.setMove();
      state.subscribe(() => {
        const currentState = state.getState();
        this.gameData = currentState.gameData;
        // if (this.gameData.playerOne && this.gameData.playerTwo) {
        //   if (
        //     this.gameData.playerOne.playerMove &&
        //     this.gameData.playerTwo.playerMove
        //   ) {
        //     if (this.gameData.playerTwo.playerMove == "nada") {
        //       console.log("resultadooo");
        //       Router.go("result-win");
        //     } else {
        //       console.log("show plays");
        //       this.showPlays();
        //     }
        //   }
        // }
      });
    }
    setClock() {
      //Crea un intervalo de cuenta regresiva desde 3 a 1
      //usa un auxiliar click para mostrar un pagina de timeout si se acaba el tiempo
      //y el player no eligio nada
      const contCount = this.shadow.querySelector(".game__container-count");
      let contador = 3;
      let click = false;
      const intervalId = setInterval(() => {
        contCount.innerHTML = ``;
        const countDiv = document.createElement("div");
        countDiv.classList.add("animate__animated");
        countDiv.classList.add("animate__fadeInDown");
        countDiv.textContent = contador.toString();
        contCount.appendChild(countDiv);

        contador--;
        //cancela el intervalo e imprime la pantalla timeout
        if (contador < 0) {
          window.clearInterval(intervalId);
          if (this.check == false) {
            console.log("voy a lose");

            state.setPlayerMove("nada");
            Router.go("/result-lose");
          }
          this.showPlays();
        }
      }, 1000);
    }
    setMove() {
      //agrega el evento click a las posibles jugadas
      //El evento guarda las jugadas en el state con el metodo setgame
      //tiene un settimeout para se alcance a ver el cambio de estilo de la jugada elegida
      //cambia el estado de click para evitar la pagina de timeout
      const playsEls = this.shadow.querySelectorAll(".game__container-play");

      for (const p of playsEls) {
        p.addEventListener("click", (e) => {
          if (!this.check) {
            p.classList.add("click");

            const target = e.target as any;

            state.setPlayerMove(target.type);
          }
          this.check = true;
        });
      }
    }
    showPlays() {
      console.log("show plays");
      console.log(
        this.gameData.playerOne.playerMove,
        this.gameData.playerTwo.playerMove
      );

      const winner = state.whoWins(
        this.gameData.playerOne.playerMove,
        this.gameData.playerTwo.playerMove
      );
      const containerEl = this.shadow.querySelector(".page-container");
      containerEl.innerHTML = ``;
      containerEl.innerHTML = `
        <div class= "game__container-result">
        <div class="game__container-result-play animate__animated animate__fadeInDown">
        <my-play type="${this.gameData.playerTwo.playerMove}" class="game__pc-play " rotate></my-play>
        </div>
        <div class="game__container-result-play animate__animated animate__fadeInUp">
        <my-play type="${this.gameData.playerOne.playerMove}" class="game__player-play"></my-play>
        </div>
        </div>
        `;
      setTimeout(() => {
        if (winner == 0) {
          Router.go("/result-lose");
        }
        if (winner == 1) {
          Router.go("/result-win");
        }
        if (winner == 2) {
          Router.go("/lobby");
        }
      }, 1600);
    }
    render() {
      const containerEl = document.createElement("div");
      containerEl.className = "page-container";
      containerEl.innerHTML = `
        <div class="game__container-count">
        </div>
       <div class="game__container-plays">
       <div class="game__container-play" type="piedra">
       <my-play type="piedra" class="game__my-play"></my-play>
       </div>
       <div class="game__container-play" type="tijera">
       <my-play type="tijera" class="game__my-play"></my-play>
       </div>
       <div class="game__container-play" type="papel">
       <my-play type="papel" class="game__my-play"></my-play>
       </div>
       </div>
        `;

      const styles = require("url:./index.css");
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = styles;
      const shadowHead = document.createElement("head");
      shadowHead.innerHTML = `
      <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
    />
      `;
      shadowHead.appendChild(linkEl);
      this.shadow.appendChild(shadowHead);
      this.shadow.appendChild(containerEl);
    }
  }
);
