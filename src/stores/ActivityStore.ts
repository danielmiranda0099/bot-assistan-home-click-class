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
        correct: 0,
        partial: 0,
        incorrect: 0,
      };
      this.saveFeedbackToStorage();
    } else {
      // Deduplicate questionsFeedback by keeping only the latest feedback for each questionId based on timestamp
      const feedbackMap = new Map<string, QuestionFeedbackData>();
      for (const feedback of this.feedbackAccumulator.questionsFeedback) {
        const existing = feedbackMap.get(feedback.questionId);
        if (!existing || feedback.timestamp > existing.timestamp) {
          feedbackMap.set(feedback.questionId, feedback);
        }
      }
      this.feedbackAccumulator.questionsFeedback = Array.from(feedbackMap.values());

      // NEW: Validate hintUsed in old feedbacks
      this.feedbackAccumulator.questionsFeedback = this.feedbackAccumulator.questionsFeedback.map(feedback => ({
        ...feedback,
        hintUsed: feedback.hintUsed ?? false // If not exists, default to false
      }));

      // Recalculate counters based on unique feedbacks
      let correct = 0;
      let partial = 0;
      let incorrect = 0;
      for (const feedback of this.feedbackAccumulator.questionsFeedback) {
        const decision = feedback.decision.toLowerCase();
        if (decision === 'correct' || decision === 'correcto') {
          correct++;
        } else if (decision === 'partial' || decision === 'parcial') {
          partial++;
        } else if (decision === 'incorrect' || decision === 'incorrecto') {
          incorrect++;
        }
      }
      this.feedbackAccumulator.correct = correct;
      this.feedbackAccumulator.partial = partial;
      this.feedbackAccumulator.incorrect = incorrect;

      // Set answeredQuestions to the count of unique questionIds
      this.feedbackAccumulator.answeredQuestions = this.feedbackAccumulator.questionsFeedback.length;

      // Ensure totalQuestions is set if missing
      if (typeof this.feedbackAccumulator.totalQuestions !== 'number') {
        this.feedbackAccumulator.totalQuestions = activity.questions.length;
      }
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
      console.log(`Question ${currentQuestion.id} reset for retry`);
    }
  }

  addQuestionFeedback(feedback: QuestionFeedbackData): void {
    if (!this.feedbackAccumulator) {
      console.error('No feedback accumulator initialized');
      return;
    }

    // Remove any existing feedback for the same questionId to ensure no duplicates
    this.feedbackAccumulator.questionsFeedback = this.feedbackAccumulator.questionsFeedback.filter(
      (f) => f.questionId !== feedback.questionId
    );

    // Add the new feedback
    this.feedbackAccumulator.questionsFeedback.push(feedback);

    // Recalculate counters based on all unique feedbacks
    let correct = 0;
    let partial = 0;
    let incorrect = 0;
    for (const f of this.feedbackAccumulator.questionsFeedback) {
      const decision = f.decision.toLowerCase();
      if (decision === 'correct' || decision === 'correcto') {
        correct++;
      } else if (decision === 'partial' || decision === 'parcial') {
        partial++;
      } else if (decision === 'incorrect' || decision === 'incorrecto') {
        incorrect++;
      }
    }
    this.feedbackAccumulator.correct = correct;
    this.feedbackAccumulator.partial = partial;
    this.feedbackAccumulator.incorrect = incorrect;

    // Set answeredQuestions to the count of unique questionIds
    this.feedbackAccumulator.answeredQuestions = new Set(
      this.feedbackAccumulator.questionsFeedback.map((f) => f.questionId)
    ).size;

    this.saveFeedbackToStorage();
    console.log(`Feedback added for question ${feedback.questionId}`);
  }

  getFeedbackAccumulator(): ActivityFeedbackAccumulator | null {
    return this.feedbackAccumulator;
  }

  isActivityComplete(): boolean {
    if (!this.feedbackAccumulator) {
      console.log('No feedback accumulator, activity not complete');
      return false;
    }
    const uniqueQuestions = new Set(this.feedbackAccumulator.questionsFeedback.map(f => f.questionId));
    const isComplete = uniqueQuestions.size === this.feedbackAccumulator.totalQuestions;
    console.log(`Activity complete check: ${uniqueQuestions.size} unique questions answered out of ${this.feedbackAccumulator.totalQuestions}, complete: ${isComplete}`);
    return isComplete;
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
      // Reset counters to 0 before clearing
      this.feedbackAccumulator.correct = 0;
      this.feedbackAccumulator.partial = 0;
      this.feedbackAccumulator.incorrect = 0;
      console.log(`Reset counters to 0 for activity ${this.feedbackAccumulator.activityId}`);

      const key = `activity-feedback-${this.feedbackAccumulator.activityId}`;
      localStorage.removeItem(key);
      console.log(`Feedback cleared from storage for activity ${this.feedbackAccumulator.activityId}`);
      this.feedbackAccumulator = null;
    } catch (error) {
      console.error('Failed to clear feedback from storage:', error);
    }
  }
}