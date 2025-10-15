import type { Activity, Question, QuestionFeedbackData, ActivityFeedbackAccumulator } from '../types';

export class ActivityStore {
  currentActivity: Activity | null = null;
  currentQuestionIndex: number = 0;
  userResponses: string[] = [];
  answeredQuestions: Set<string> = new Set();
  feedbackAccumulator: ActivityFeedbackAccumulator | null = null;

  loadActivity(activity: Activity): void {
    this.currentActivity = activity;
    this.currentQuestionIndex = 0;
    this.userResponses = [];
    this.answeredQuestions.clear();
    this.feedbackAccumulator = this.loadFeedbackFromStorage(activity.id);
    if (!this.feedbackAccumulator) {
      this.feedbackAccumulator = {
        activityId: activity.id,
        activityTitle: activity.title,
        activityLevel: activity.level,
        activityContext: activity.activityContext,
        activityDescription: activity.description,
        questionsFeedback: [],
        totalQuestions: activity.questions.length,
        answeredQuestions: 0,
      };
      this.saveFeedbackToStorage();
    }
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
      if (this.feedbackAccumulator) {
        this.feedbackAccumulator.questionsFeedback = this.feedbackAccumulator.questionsFeedback.filter(
          (feedback) => feedback.questionId !== currentQuestion.id
        );
        this.feedbackAccumulator.answeredQuestions = this.feedbackAccumulator.questionsFeedback.length;
        this.saveFeedbackToStorage();
      }
      console.log(`Question ${currentQuestion.id} reset for retry`);
    }
  }

  addQuestionFeedback(feedback: QuestionFeedbackData): void {
    if (!this.feedbackAccumulator) {
      console.error('No feedback accumulator initialized');
      return;
    }
    this.feedbackAccumulator.questionsFeedback.push(feedback);
    this.feedbackAccumulator.answeredQuestions = this.feedbackAccumulator.questionsFeedback.length;
    this.saveFeedbackToStorage();
    console.log(`Feedback added for question ${feedback.questionId}`);
  }

  getFeedbackAccumulator(): ActivityFeedbackAccumulator | null {
    return this.feedbackAccumulator;
  }

  isActivityComplete(): boolean {
    if (!this.feedbackAccumulator) return false;
    return this.feedbackAccumulator.answeredQuestions === this.feedbackAccumulator.totalQuestions;
  }

  private saveFeedbackToStorage(): void {
    if (!this.feedbackAccumulator) {
      console.error('No feedback accumulator to save');
      return;
    }
    try {
      const key = `activity-feedback-${this.feedbackAccumulator.activityId}`;
      localStorage.setItem(key, JSON.stringify(this.feedbackAccumulator));
      console.log(`Feedback saved to storage for activity ${this.feedbackAccumulator.activityId}`);
    } catch (error) {
      console.error('Failed to save feedback to storage:', error);
    }
  }

  private loadFeedbackFromStorage(activityId: string): ActivityFeedbackAccumulator | null {
    try {
      const key = `activity-feedback-${activityId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`Feedback loaded from storage for activity ${activityId}`);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load feedback from storage:', error);
    }
    return null;
  }

  clearFeedbackFromStorage(): void {
    if (!this.feedbackAccumulator) {
      console.error('No feedback accumulator to clear');
      return;
    }
    try {
      const key = `activity-feedback-${this.feedbackAccumulator.activityId}`;
      localStorage.removeItem(key);
      console.log(`Feedback cleared from storage for activity ${this.feedbackAccumulator.activityId}`);
      this.feedbackAccumulator = null;
    } catch (error) {
      console.error('Failed to clear feedback from storage:', error);
    }
  }
}