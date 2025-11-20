export class TextToSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentMessageId: string | null = null;
  private playedMessages: Set<string> = new Set();
  private isPlaying: boolean = false;

  private cleanTextForTTS(text: string): string {
    let cleaned = text;

    // 1. Remover bloques de código markdown
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

    // 2. Remover etiquetas HTML
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // 3. Convertir entidades HTML comunes
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/&/g, '&');
    cleaned = cleaned.replace(/</g, '<');
    cleaned = cleaned.replace(/>/g, '>');
    cleaned = cleaned.replace(/"/g, '"');

    // 4. Remover markdown básico
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
    cleaned = cleaned.replace(/#{1,6}\s/g, ''); // Headers
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links

    // 5. Remover emojis (rangos Unicode comunes)
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Symbols & pictographs
    cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport & map
    cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Misc symbols
    cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats

    // 6. Limpiar espacios múltiples y saltos de línea
    cleaned = cleaned.replace(/\n+/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();

    return cleaned;
  }

  speak(
    text: string,
    language: string,
    messageId: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): void {
    this.stop();

    // Limpiar el texto antes de enviarlo al TTS
    const cleanText = this.cleanTextForTTS(text);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Mapear idioma correctamente según el campo language del feedback
    if (language === 'es') {
      utterance.lang = 'es-ES';
    } else if (language === 'en') {
      utterance.lang = 'en-US';
    } else {
      // Fallback para otros idiomas o valores no reconocidos
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.9;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.currentMessageId = messageId;
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.currentMessageId = null;
      this.markAsPlayed(messageId);
      callbacks?.onEnd?.();
    };

    this.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.isPlaying) {
      speechSynthesis.cancel();
      this.isPlaying = false;
      this.currentMessageId = null;
      this.currentUtterance = null;
    }
  }

  hasBeenPlayed(messageId: string): boolean {
    return this.playedMessages.has(messageId);
  }

  markAsPlayed(messageId: string): void {
    this.playedMessages.add(messageId);
  }

  getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  clearPlayedHistory(): void {
    this.playedMessages.clear();
  }
}