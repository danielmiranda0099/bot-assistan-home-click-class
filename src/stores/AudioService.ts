export class AudioService {
  private enabled: boolean = true;
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.precacheSounds();
  }

  private async precacheSounds(): Promise<void> {
    const soundFiles = [
      { name: "click", path: "/sfx/click.mp3" },
      { name: "message", path: "/sfx/message.mp3" },
      { name: "microConnect", path: "/sfx/micro-connect.mp3" },
      { name: "microDisconnect", path: "/sfx/micro-disconnect.mp3" },
      { name: "thinking", path: "/sfx/thinking.mp3" },
    ];

    for (const { name, path } of soundFiles) {
      try {
        const audio = new Audio(path);
        await new Promise((resolve, reject) => {
          audio.addEventListener("canplaythrough", resolve, { once: true });
          audio.addEventListener("error", reject, { once: true });
          audio.load();
        });
        this.sounds.set(name, audio);
      } catch (error) {
        console.error(`Failed to precache sound: ${name}`, error);
      }
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  async play(soundName: string): Promise<void> {
    if (!this.enabled) return;

    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error(`Failed to play sound: ${soundName}`, error);
    }
  }

  async playLoop(soundName: string): Promise<void> {
    if (!this.enabled) return;

    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      audio.currentTime = 0;
      audio.loop = true;
      await audio.play();
    } catch (error) {
      console.error(`Failed to play loop sound: ${soundName}`, error);
    }
  }

  stop(soundName: string): void {
    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  }
}
