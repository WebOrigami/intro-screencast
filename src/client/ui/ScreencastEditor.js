import SceneMixin from "./SceneMixin.js";

export default class ScreencastEditor extends SceneMixin(HTMLElement) {
  get playable() {
    return this.terminalElement?.playable ?? false;
  }

  get playing() {
    return super.playing;
  }
  set playing(playing) {
    super.playing = playing;
    if (this.terminalElement) {
      this.terminalElement.playing = playing;
    }
  }

  get terminalElement() {
    return this.querySelector("screencast-terminal");
  }
}
