export class BackgroundManager {
  constructor(canvas) {
    this.canvas = canvas;

    this.clouds = [];

    for (let i = 0; i < 18; i++) {
      this.clouds.push(this.createCloud(true));
    }
  }

  createCloud(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -50,
      w: 60 + Math.random() * 90,
      h: 25 + Math.random() * 25,
      speed: 0.15 + Math.random() * 0.25,
    };
  }

  update() {
    for (const c of this.clouds) {
      c.y += c.speed;

      if (c.y > this.canvas.height + 60) {
        c.x = Math.random() * this.canvas.width;
        c.y = -50;
        c.w = 60 + Math.random() * 90;
        c.h = 25 + Math.random() * 25;
        c.speed = 0.15 + Math.random() * 0.25;
      }
    }
  }

  draw(ctx) {
    // Sky Gradient
    const g = ctx.createLinearGradient(0, 0, 0, this.canvas.height);

    g.addColorStop(0, "#6ec6ff");
    g.addColorStop(1, "#dff6ff");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.9)";

    for (const c of this.clouds) {
      ctx.beginPath();

      ctx.ellipse(c.x, c.y, c.w * 0.22, c.h * 0.5, 0, 0, Math.PI * 2);

      ctx.ellipse(
        c.x + c.w * 0.2,
        c.y - 5,
        c.w * 0.28,
        c.h * 0.6,
        0,
        0,
        Math.PI * 2,
      );

      ctx.ellipse(
        c.x + c.w * 0.42,
        c.y,
        c.w * 0.22,
        c.h * 0.5,
        0,
        0,
        Math.PI * 2,
      );

      ctx.fill();
    }
  }
}
