import { effect, signal } from "@preact/signals-core";
import playSoundEffect from "./playSoundEffect.js";
import SceneMixin from "./SceneMixin.js";

const startingFrames = 2; // Waiting to start typing
const waitingPhaseFrames = 3; // Waiting to press return key
const runningPhaseFrames = 4; // Waiting for program to run

export default class ScreencastTerminal extends SceneMixin(HTMLElement) {
  constructor() {
    super();
    this.command = null;
    this.frameCount = 0;
    this.nextFrameTimeout = null;
    this.textLength = 0;
    this.timeSignal = signal(-1);
  }

  connectedCallback() {
    this.command = this.querySelector(".command");
    this.textLength = this.command?.textContent.length ?? 0;

    this.frameCount =
      startingFrames +
      (this.textLength ?? 0) +
      waitingPhaseFrames +
      runningPhaseFrames;

    this.addEventListener("click", () => {
      this.playing = !this.playing;
    });

    effect(() => {
      if (!this.playing) {
        clearTimeout(this.nextFrameTimeout);
        this.nextFrameTimeout = null;
      } else if (this.time >= 0 && this.time <= this.frameCount) {
        this.render(this.time);

        // Next tick
        if (this.time === this.frameCount) {
          this.playing = false;
          this.dispatchEvent(
            new CustomEvent("animation-ended", { bubbles: true })
          );
        } else {
          let delay = 100 + Math.random() * 100;
          // Give a shorter delay if typing an alphabetic character
          const character =
            this.phase(this.time) === "typing"
              ? this.command.textContent[this.time - startingFrames]
              : null;
          if (character && /[A-Za-z]/i.test(character)) {
            delay /= 2;
          }
          this.nextFrameTimeout = setTimeout(() => {
            this.time++;
          }, delay);
        }
      }
    });
  }

  phase(time) {
    if (time <= startingFrames) {
      return "starting";
    } else if (time <= startingFrames + this.textLength) {
      return "typing";
    } else if (time <= startingFrames + this.textLength + waitingPhaseFrames) {
      return "waiting";
    } else if (time < this.frameCount) {
      return "running";
    } else {
      return "done";
    }
  }

  get playable() {
    return this.command?.textContent.length > 0;
  }

  get playing() {
    return super.playing;
  }
  set playing(playing) {
    super.playing = playing;
    this.time = 0;
  }

  render(time) {
    // Update phase
    const phase = this.phase(time);
    this.classList.toggle("starting", phase === "starting");
    this.classList.toggle("typing", phase === "typing");
    this.classList.toggle("waiting", phase === "waiting");
    this.classList.toggle("running", phase === "running");

    if (this.command) {
      // Simulate typing
      this.command.style.width =
        phase === "starting"
          ? "0ch"
          : phase === "typing"
          ? `${time - startingFrames}ch`
          : "";

      // Play sound effects; don't wait
      if (phase === "typing" && time > 0) {
        playSoundEffect("keyClick");
      } else if (
        time ===
        startingFrames + this.textLength + waitingPhaseFrames
      ) {
        playSoundEffect("returnClick");
      }
    }
  }

  get time() {
    return this.timeSignal.value;
  }
  set time(time) {
    this.timeSignal.value = time;
  }
}

customElements.define("screencast-terminal", ScreencastTerminal);
