export class TrailingCursor {
  constructor(options = {}) {
    this.options = options;
    this.hasWrapperEl = !!options.element;
    this.element = this.hasWrapperEl ? options.element : document.body;

    this.totalParticles = options.particles ?? 15;
    this.rate = options.rate ?? 0.4;
    this.zIndex = options.zIndex ?? "9999999999";
    this.baseImageSrc = options.baseImageSrc ?? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAATCAYAAACk9eypAAAAAXNSR0IArs4c6QAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAhGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADKADAAQAAAABAAAAEwAAAAAChpcNAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAABqElEQVQoFY3SPUvDQBgH8BREpRHExYiDgmLFl6WC+AYmWeyLg4i7buJX8DMpOujgyxGvUYeCgzhUQUSKKLUS0+ZyptXh8Z5Ti621ekPyJHl+uftfomhaf9Ei5JyxXKfynyEA6EYcLHpwyflT958GAQ7DTABNHd8EbtDbEH2BD5QEQmi2mM8P/Iq+A0SzszEg+3sPjDnDdVEtQKQbMUidHD3xVzf6A9UDEmEm+8h9KTqTVUjT+vB53aHrCbAPiceYq1dQI1Aqv4EhMll0jzv+Y0yiRgCnLRSYyDQHVoqUXe4uKL9l+L7GXC4vkMhE6eW/AOJs9k583ORDUyXMZ8F5SVHVVnllmPNKSFagAJ5DofaqGXw/gHBYg51dIldkmknY3tguv3jOtHR4+MqAzaraJXbEhqHhcQlwGSOi5pytVQHZLN5s0WNe8HPrLYlFsO20RPHkImxsbmHdLJFI76th7Z4SeuF53hTeFLvhRCJRCTKZKxgdnRDbW+iozFJbBMw14/ElwGYc0egMBMFzT21f5Rog33Z7dX02GBm7WV5ZfT5Nn5bE3zuCDe9UxdTpNvK+5AAAAABJRU5ErkJggg==";

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.cursor = { x: this.width / 2, y: this.height / 2 };
    this.particles = [];
    this.cursorsInitted = false;

    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion.addEventListener("change", () => {
      this.prefersReducedMotion.matches ? this.destroy() : this.init();
    });

    this.baseImage = new Image();
    this.baseImage.src = this.baseImageSrc;

    this.init();
  }

  init() {
    if (this.prefersReducedMotion.matches) {
      console.log("prefers-reduced-motion 开启，未初始化 cursor");
      return;
    }

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    Object.assign(this.canvas.style, {
      position: this.hasWrapperEl ? "absolute" : "fixed",
      top: "0px",
      left: "0px",
      pointerEvents: "none",
      zIndex: this.zIndex
    });

    if (this.hasWrapperEl) {
      this.canvas.width = this.element.clientWidth;
      this.canvas.height = this.element.clientHeight;
      this.element.appendChild(this.canvas);
    } else {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      document.body.appendChild(this.canvas);
    }

    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onResizeBound = this.onResize.bind(this);
    this.element.addEventListener("mousemove", this.onMouseMoveBound);
    window.addEventListener("resize", this.onResizeBound);
  }

  onMouseMove(e) {
    if (this.hasWrapperEl) {
      const rect = this.element.getBoundingClientRect();
      this.cursor.x = e.clientX - rect.left;
      this.cursor.y = e.clientY - rect.top;
    } else {
      this.cursor.x = e.clientX;
      this.cursor.y = e.clientY;
    }

    if (!this.cursorsInitted) {
      this.cursorsInitted = true;
      this.particles = Array.from(
        { length: this.totalParticles },
        () => new Particle(this.cursor.x, this.cursor.y, this.baseImage)
      );
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.hasWrapperEl) {
      this.canvas.width = this.element.clientWidth;
      this.canvas.height = this.element.clientHeight;
    } else {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  updateParticles() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let { x, y } = this.cursor;

    this.particles.forEach((particle, i) => {
      const next = this.particles[i + 1] ?? this.particles[0];
      particle.position.x = x;
      particle.position.y = y;
      particle.draw(this.context);
      x += (next.position.x - x) * this.rate;
      y += (next.position.y - y) * this.rate;
    });
  }

  loop() {
    this.updateParticles();
    this.animationFrame = requestAnimationFrame(() => this.loop());
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    this.canvas?.remove();
    this.element.removeEventListener("mousemove", this.onMouseMoveBound);
    window.removeEventListener("resize", this.onResizeBound);
  }
}

// 粒子类
class Particle {
  constructor(x, y, image) {
    this.position = { x, y };
    this.image = image;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }
}
