import { Router } from "@vaadin/router";

const router = new Router(document.querySelector(".root"));
router.setRoutes([
  { path: "/", component: "home-page" },
  { path: "/join-room", component: "join-room-page" },
  { path: "/login", component: "login-page" },
  { path: "/room-full", component: "room-full-page" },
  { path: "/room-code", component: "room-code-page" },
  { path: "/lobby", component: "lobby-page" },
  { path: "/game", component: "game-page" },
  { path: "/result-win", component: "result-win-page" },
  { path: "/result-lose", component: "result-lose-page" },
]);
