export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    window.addEventListener("resize", () => this.resize());

    this.resize();
  }

  resize() {
    const aspect = 400 / 721;

    const h = window.innerHeight;
    const w = h * aspect;

    this.canvas.width = w;
    this.canvas.height = h;
  }
}
