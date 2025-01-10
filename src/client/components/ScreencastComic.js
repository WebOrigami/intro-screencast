import { effect, signal } from "@preact/signals-core";

export default class ScreencastComic extends HTMLElement {
  constructor() {
    super();
    this.playingSignal = signal(false);
    this.scrollingExpectedSignal = signal(false);
    this.scrollingExpectedTimeout = null;
    this.selectNextTimeout = null;
    this.selectedIndexSignal = signal(-1);
  }

  connectedCallback() {
    // Make the comic a listbox
    this.setAttribute("role", "listbox");

    // Make the comic focusable
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }

    // Clicking an item selects it
    // this.addEventListener("click", (event) => {
    //   const item = event.target.closest("screencast-panel");
    //   if (item) {
    //     this.selectedIndex = this.items.indexOf(item);
    //   }
    //   const playButton = event.target.closest("button");
    //   if (playButton) {
    //     // Toggle play state
    //     this.playing = !this.playing;
    //   }
    // });

    // Tell items whether they're selected
    effect(() => {
      const selectedIndex = this.selectedIndex;
      this.selectedItem?.scrollIntoView({ behavior: "smooth" });
      this.items.forEach((item, index) => {
        item.selected = index === selectedIndex;
      });
      if (this.playing) {
        this.selectedItem?.play();
      }
    });

    // When playing, automatically advance to the next item
    effect(() => {
      this.setAttribute("data-playing", this.playing);
      if (this.playing) {
        console.log("playing");
        // this.selectNextTimeout = setInterval(() => {
        //   this.selectNext();
        //   if (this.selectedIndex === this.items.length - 1) {
        //     this.playing = false;
        //   }
        // }, 2000);
        this.selectedItem?.play();
      } else {
        console.log("pausing");
        clearInterval(this.selectNextTimeout);
        this.selectNextTimeout = null;
        this.selectedItem?.pause();
      }
    });

    // When a panel finishes, advance to the next panel
    this.addEventListener("panel-ended", () => {
      if (this.selectedIndex < this.items.length - 1) {
        this.selectNext();
      } else {
        this.playing = false;
      }
    });

    // Home/End/Up/Down keys move selection, Space toggles play
    this.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          this.selectPrevious();
          break;

        case "ArrowDown":
          event.preventDefault();
          this.selectNext();
          break;

        case "End":
          event.preventDefault();
          this.selectLast();
          break;

        case "Home":
          event.preventDefault();
          this.selectFirst();
          break;

        // Space toggles play state
        case " ":
          event.preventDefault();
          this.playing = !this.playing;
          break;
      }
    });

    // If the document scrolls and we weren't expecting it to, pause
    // document.addEventListener("scroll", () => {
    //   if (!this.scrollingExpected) {
    //     console.log("user scrolled");
    //     this.pause();

    //     // Select item in the center of the viewport
    //     const centerItem = this.getCenterItem();
    //     if (centerItem) {
    //       this.selectedIndex = this.items.indexOf(centerItem);
    //     }
    //   }
    // });

    // If we have items, select one
    if (this.items.length > 0) {
      if (document.documentElement.scrollTop > 0) {
        // Page was reloaded while scrolled down, select item in center
        const centerItem = this.getCenterItem();
        if (centerItem) {
          this.selectedIndex = this.items.indexOf(centerItem);
        }
      } else {
        // Select first item by default
        this.selectFirst();
      }
    }
  }

  get items() {
    return Array.from(this.children);
  }

  pause() {
    this.playing = false;
  }

  play() {
    this.playing = true;
  }

  get playing() {
    return this.playingSignal.value;
  }
  set playing(playing) {
    this.playingSignal.value = playing;
  }

  // Return the item in the center of the viewport
  getCenterItem() {
    const middle = window.innerHeight / 2;
    const item = this.items.find((item) => {
      const itemRect = item.getBoundingClientRect();
      return itemRect.top <= middle && middle <= itemRect.bottom;
    });
    return item;
  }

  get scrollingExpected() {
    return this.scrollingExpectedSignal.value;
  }
  set scrollingExpected(scrollingExpected) {
    this.scrollingExpectedSignal.value = scrollingExpected;
  }

  get selectedItem() {
    return this.items[this.selectedIndex] ?? null;
  }

  get selectedIndex() {
    return this.selectedIndexSignal.value;
  }
  set selectedIndex(selected) {
    // Programmatically scrolling the document is expected
    this.scrollingExpected = true;
    if (this.scrollingExpectedTimeout) {
      clearTimeout(this.scrollingExpectedTimeout);
    }
    this.scrollingExpectedTimeout = setTimeout(() => {
      this.scrollingExpected = false;
      this.scrollingExpectedTimeout = null;
    }, 1000);

    this.selectedIndexSignal.value = selected;
  }

  selectFirst() {
    this.selectedIndex = 0;
  }

  selectLast() {
    this.selectedIndex = this.items.length - 1;
  }

  selectNext() {
    this.selectedIndex = Math.min(
      this.items.length - 1,
      this.selectedIndex + 1
    );
  }

  selectPrevious() {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
  }
}

customElements.define("screencast-comic", ScreencastComic);