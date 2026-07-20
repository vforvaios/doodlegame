import { CanvasManager } from "./js/CanvasManager";
import { DoodleGame } from "./js/DoodleGame";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game");

  const cm = new CanvasManager(canvas);

  new DoodleGame(cm);
});
