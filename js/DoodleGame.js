import { BackgroundManager } from "./BackgroundManager.js";
export class DoodleGame {
  constructor(canvasManager) {
    this.canvas = canvasManager.canvas;
    this.ctx = canvasManager.ctx;
    this.background = new BackgroundManager(this.canvas);

    this.gravity = 0.4;
    this.bounceVelocity = -12;
    this.score = 0;
    this.gameOver = false;
    this.animationFrameId = null;

    this.player = {
      x: this.canvas.width / 2 - 20,
      y: this.canvas.height - 150,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 6,
    };

    this.platforms = [];
    this.platformWidth = 70;
    this.platformHeight = 15;

    this.keys = {};
    this.initEvents();
    this.initPlatforms();
    this.animate();
  }

  initPlatforms() {
    this.platforms = [];
    this.platforms.push({
      x: this.canvas.width / 2 - this.platformWidth / 2,
      y: this.canvas.height - 50,
    });

    for (let i = 0; i < 7; i++) {
      this.platforms.push({
        x: Math.random() * (this.canvas.width - this.platformWidth),
        y: this.canvas.height - i * 85 - 150, // Μειωμένο ελαφρώς για πιο στενά canvas
      });
    }
  }

  initEvents() {
    // --- KEYBOARD CONTROLS (Για PC) ---
    this._keydown = (e) => {
      this.keys[e.code] = true;
      if (this.gameOver && e.code === "Space") {
        this.resetGame();
      }
    };

    this._keyup = (e) => {
      this.keys[e.code] = false;
    };

    window.addEventListener("keydown", this._keydown);
    window.addEventListener("keyup", this._keyup);

    // --- SMOOTH TOUCH CONTROLS (Για Mobile PWA) ---
    this.touchStartX = 0;

    this._touchstart = (e) => {
      // Αν έχει γίνει Game Over, ένα απλό άγγιγμα οπουδήποτε στην οθόνη κάνει Restart!
      if (this.gameOver) {
        this.resetGame();
        return;
      }
      this.touchStartX = e.touches[0].clientX;
    };

    this._touchmove = (e) => {
      if (this.gameOver) return;

      const touchCurrentX = e.touches[0].clientX;
      const diffX = touchCurrentX - this.touchStartX;

      // Υπολογισμός αναλογικής ταχύτητας βάσει της απόστασης του swipe
      let targetVelocity = diffX / 12;

      // Περιορισμός (Clamp) στα όρια της μέγιστης ταχύτητας του παίκτη
      if (targetVelocity > this.player.speed)
        targetVelocity = this.player.speed;
      if (targetVelocity < -this.player.speed)
        targetVelocity = -this.player.speed;

      // Linear Interpolation (Lerp) για εξαιρετικά ομαλή επιτάχυνση/επιβράδυνση
      this.player.vx += (targetVelocity - this.player.vx) * 0.3;
    };

    this._touchend = () => {
      // Αφήνουμε την τριβή στην update() να σταματήσει το vx γλυκά
    };

    // Σύνδεση των events απευθείας στο canvas
    this.canvas.addEventListener("touchstart", this._touchstart, {
      passive: true,
    });
    this.canvas.addEventListener("touchmove", this._touchmove, {
      passive: true,
    });
    this.canvas.addEventListener("touchend", this._touchend, { passive: true });
  }

  resetGame() {
    // Ακύρωση τυχόν παλιού loop για απόλυτη ασφάλεια
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.player.x = this.canvas.width / 2 - 20;
    this.player.y = this.canvas.height - 150;
    this.player.vx = 0;
    this.player.vy = 0;
    this.score = 0;
    this.gameOver = false;
    this.initPlatforms();
    this.animate();
  }

  update() {
    if (this.gameOver) return;

    // --- ΟΡΙΖΟΝΤΙΑ ΚΙΝΗΣΗ (Keyboard & Touch με Smooth Physics) ---
    if (this.keys["ArrowLeft"]) {
      this.player.vx = -this.player.speed;
    } else if (this.keys["ArrowRight"]) {
      this.player.vx = this.player.speed;
    } else {
      // Εφαρμογή τριβής/αδράνειας όταν δεν υπάρχει ενεργή εντολή κίνησης
      this.player.vx *= 0.82;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    this.player.x += this.player.vx;

    // Οθόνη Wrap-around (Εμφάνιση από την άλλη πλευρά)
    if (this.player.x + this.player.width < 0)
      this.player.x = this.canvas.width;
    if (this.player.x > this.canvas.width) this.player.x = -this.player.width;

    // Κάθετη κίνηση και βαρύτητα
    this.player.vy += this.gravity;
    this.player.y += this.player.vy;

    // Έλεγχος σύγκρουσης με πλατφόρμες (μόνο κατά την πτώση)
    if (this.player.vy > 0) {
      this.platforms.forEach((platform) => {
        if (
          this.player.x + this.player.width > platform.x &&
          this.player.x < platform.x + this.platformWidth &&
          this.player.y + this.player.height >= platform.y &&
          this.player.y + this.player.height <=
            platform.y + this.platformHeight + this.player.vy
        ) {
          this.player.vy = this.bounceVelocity;
        }
      });
    }

    // Κίνηση κάμερας προς τα πάνω
    if (this.player.y < this.canvas.height / 2) {
      let diff = this.canvas.height / 2 - this.player.y;
      this.player.y = this.canvas.height / 2;
      this.score += Math.floor(diff);

      this.platforms.forEach((platform) => {
        platform.y += diff;
      });
    }

    // Αναγέννηση πλατφορμών που βγήκαν κάτω από την οθόνη
    this.platforms.forEach((platform) => {
      if (platform.y > this.canvas.height) {
        platform.y = 0 - this.platformHeight;
        platform.x = Math.random() * (this.canvas.width - this.platformWidth);
      }
    });

    // Έλεγχος Game Over
    if (this.player.y > this.canvas.height) {
      this.gameOver = true;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.background.update();
    this.background.draw(this.ctx);

    // Σχεδίαση Πλατφορμών
    this.ctx.fillStyle = "#2ecc71";
    this.platforms.forEach((platform) => {
      this.ctx.fillRect(
        platform.x,
        platform.y,
        this.platformWidth,
        this.platformHeight,
      );
    });

    // Σχεδίαση Παίκτη
    this.ctx.fillStyle = "#e67e22";
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
    );

    // Σχεδίαση Σκορ
    this.ctx.fillStyle = "#333";
    this.ctx.font = "20px Arial";
    this.ctx.fillText("Score: " + this.score, 20, 35);

    // Οθόνη Game Over
    if (this.gameOver) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "#fff";
      this.ctx.font = "30px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "GAME OVER",
        this.canvas.width / 2,
        this.canvas.height / 2 - 20,
      );
      this.ctx.font = "18px Arial";
      this.ctx.fillText(
        "Τελικό Σκορ: " + this.score,
        this.canvas.width / 2,
        this.canvas.height / 2 + 20,
      );
      this.ctx.fillText(
        "TAP στην οθόνη για Replay",
        this.canvas.width / 2,
        this.canvas.height / 2 + 60,
      );
      this.ctx.textAlign = "start";
    }
  }

  animate() {
    if (this.gameOver) {
      this.draw(); // Σχεδίαση της οθόνης Game Over μία φορά
      return; // Διακοπή του animation loop
    }

    this.update();
    this.draw();

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
