import type { Message, QuestionStateData, ActivityStorageData } from '../types';

const STORAGE_KEY = 'bot-lesson-activity-state';

export class ChatStore {
  questionChats: Map<string, Message[]> = new Map(); // Made public for reset functionality
  private currentQuestionId: string | null = null;

  setCurrentQuestion(questionId: string): void {
    this.currentQuestionId = questionId;
    if (!this.questionChats.has(questionId)) {
      this.questionChats.set(questionId, []);
    }
    console.log(`Switched to question: ${questionId}`);
  }

  addMessage(message: Message): void {
    if (!this.currentQuestionId) {
      console.warn('Cannot add message: no current question set');
      return;
    }
    const messages = this.questionChats.get(this.currentQuestionId) || [];
    messages.push(message);
    this.questionChats.set(this.currentQuestionId, messages);
  }

  getMessages(): Message[] {
    if (!this.currentQuestionId) {
      return [];
    }
    return this.questionChats.get(this.currentQuestionId) || [];
  }

  clearMessages(): void {
    if (this.currentQuestionId) {
      this.questionChats.set(this.currentQuestionId, []);
      console.log(`Cleared messages for question: ${this.currentQuestionId}`);
    }
  }

  removeMessage(id: string): void {
    if (!this.currentQuestionId) return;
    
    const messages = this.questionChats.get(this.currentQuestionId) || [];
    const filtered = messages.filter(message => message.id !== id);
    this.questionChats.set(this.currentQuestionId, filtered);
  }

  getMessagesForQuestion(questionId: string): Message[] {
    return this.questionChats.get(questionId) || [];
  }

  clearMessagesForQuestion(questionId: string): void {
    this.questionChats.set(questionId, []);
    console.log(`Cleared messages for question: ${questionId}`);
  }

  saveQuestionToStorage(questionId: string, data: QuestionStateData): void {
    try {
      // Cargar estado completo actual
      const storageData = this.loadFullStorageData();

      // Actualizar con nueva data
      storageData.questions[questionId] = data;

      // Guardar de vuelta
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      console.log(`Saved question ${questionId} to localStorage`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Si el storage está lleno, limpiar y reintentar
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');
        this.clearAllStorage();
      }
    }
  }

  loadQuestionFromStorage(questionId: string): QuestionStateData | null {
    try {
      const storageData = this.loadFullStorageData();
      return storageData.questions[questionId] || null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  private loadFullStorageData(): ActivityStorageData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { activityId: '', questions: {}, currentQuestionIndex: 0 };
      }

      const parsed = JSON.parse(raw);

      // Validación básica
      if (!parsed.questions || typeof parsed.questions !== 'object') {
        throw new Error('Invalid storage structure');
      }

      return parsed as ActivityStorageData;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      // Si hay corrupción, limpiar y retornar estructura vacía
      this.clearAllStorage();
      return { activityId: '', questions: {}, currentQuestionIndex: 0 };
    }
  }

  clearAllStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared all localStorage data');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  initializeStorage(activityId: string): void {
    const storageData: ActivityStorageData = {
      activityId,
      questions: {},
      currentQuestionIndex: 0
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      console.log(`Initialized storage for activity: ${activityId}`);
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }
}