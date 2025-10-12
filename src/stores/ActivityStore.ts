import type { Activity, Question } from '../types';

export class ActivityStore {
  currentActivity: Activity | null = null;
  currentQuestionIndex: number = 0;
  userResponses: string[] = [];
  answeredQuestions: Set<string> = new Set();

  loadActivity(activity: Activity): void {
    this.currentActivity = activity;
    this.currentQuestionIndex = 0;
    this.userResponses = [];
    this.answeredQuestions.clear();
  }

  getCurrentQuestion(): Question | null {
    if (!this.currentActivity) return null;
    return this.currentActivity.questions[this.currentQuestionIndex] || null;
  }

  nextQuestion(): boolean {
    if (!this.currentActivity) return false;
    if (this.currentQuestionIndex < this.currentActivity.questions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    }
    return false;
  }

  markQuestionAsAnswered(questionId: string): void {
    this.answeredQuestions.add(questionId);
    console.log(`Question ${questionId} marked as answered. Total answered: ${this.answeredQuestions.size}`);
  }

  isQuestionAnswered(questionId: string): boolean {
    return this.answeredQuestions.has(questionId);
  }

  resetCurrentQuestion(): void {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      this.answeredQuestions.delete(currentQuestion.id);
      console.log(`Question ${currentQuestion.id} reset for retry`);
    }
  }
}