import { Router } from "@vaadin/router";
import { stat } from "fs";
import { state } from "../../state";

customElements.define(
  "game-page",
  class Game extends HTMLElement {
    shadow = this.attachShadow({ mode: "open" });
    check: boolean = false;
    mostrarJugada: boolean = false;
    gameData;

    connectedCallback() {
      const currentState = state.getState();
      currentState.started = true;
      state.setState(currentState);
      //una vez arranco el juego cambio el estado ready a falso
      state.setPlayerReady(false);
      this.render();
      this.setClock();
      this.setMove();
      state.subscribe(() => {
        const currentState = state.getState();
        this.gameData = currentState.gameData;
        if (
          this.gameData.playerOne.playerMove &&
          this.gameData.playerTwo.playerMove
        ) {
          //pongo una variable auxiliar "mostrar jugada" para que la funcion no se ejecute con cada cambio de estado
          if (!this.mostrarJugada) {
            this.showPlays();
            this.mostrarJugada = true;
          }
        }
      });
    }
    setClock() {
      //Crea un intervalo de cuenta regresiva desde 3 a 1
      const contCount = this.shadow.querySelector(".game__container-count");
      let contador = 3;

      const intervalId = setInterval(() => {
        contCount.innerHTML = ``;
        const countDiv = document.createElement("div");
        countDiv.classList.add("animate__animated");
        countDiv.classList.add("animate__fadeInDown");
        countDiv.textContent = contador.toString();
        contCount.appendChild(countDiv);

        contador--;
        //cancela el intervalo cuando contador llega a 0
        if (contador < 0) {
          window.clearInterval(intervalId);

          setTimeout(() => {
            const currentState = state.getState();
            //si alguno de los jugadores no eligio muestra la pagina timeout
            if (
              !currentState.gameData.playerOne.playerMove ||
              !currentState.gameData.playerTwo.playerMove
            ) {
              this.showTimeOutPage();
            }
          }, 3000);
        }
      }, 1000);
    }
    setMove() {
      //agrega el evento click a las posibles jugadas
      //El evento guarda las jugadas en el state con el metodo setplayerMove

      const playsEls = this.shadow.querySelectorAll(".game__container-play");

      for (const p of playsEls) {
        p.addEventListener("click", (e) => {
          //auxiliar check, permite que solo se pueda elegir jugada una vez
          if (!this.check) {
            //la clase click agrega un borde verde en la jugada elegida
            p.classList.add("click");
            const target = e.target as any;
            state.setPlayerMove(target.type);
          }
          this.check = true;
        });
      }
    }
    //funcion que muestra las jugadas en la pantalla
    showPlays() {
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
      //redirecciona a la pagina segun el resultado del juego
      // si hay empate va al lobby
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
    //pagina que aparece en caso de que algun jugador no elija nada
    showTimeOutPage() {
      const div = this.shadow.querySelector(".page-container");
      //si el player one movio muestra esta pagina ya que es el player two el que no eliigo nada
      if (this.gameData.playerOne.playerMove) {
        div.innerHTML = ``;
        div.innerHTML = `
        <my-text type="title" class="game__time-over-text">¡Ups! ${this.gameData.playerTwo.playerName} no eligió nada</my-text>
        <div class="game__container-buttons">
        <my-button class = "game__try-again-button">Reintentar</my-button>
        
        </div>
        `;
      } else {
        div.innerHTML = ``;
        div.innerHTML = `
        <my-text type="title" class="game__time-over-text">¡Ups! se acabó tu tiempo</my-text>
        <div class="game__container-buttons">
        <my-button class = "game__try-again-button">Reintentar</my-button>
        
        </div>
        `;
      }
      const tryButtonEl = div.querySelector(".game__try-again-button");
      tryButtonEl.addEventListener("click", () => {
        state.resetGameData();
        Router.go("/lobby");
      });
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
