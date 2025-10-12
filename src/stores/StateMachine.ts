import { BotState } from '../types';
import type { StateMachine } from '../types';

export class BotStateMachine implements StateMachine {
  currentState: BotState = BotState.INIT;

  private allowedTransitions: Record<BotState, BotState[]> = {
    [BotState.INIT]: [BotState.READY_CHECK],
    [BotState.READY_CHECK]: [BotState.ASK],
    [BotState.ASK]: [BotState.LISTEN_INPUT],
    [BotState.LISTEN_INPUT]: [BotState.EVALUATE],
    [BotState.EVALUATE]: [BotState.FEEDBACK],
    [BotState.FEEDBACK]: [BotState.NEXT_PROMPT], // Solo puede ir a NEXT_PROMPT (no avanza automáticamente)
    [BotState.NEXT_PROMPT]: [BotState.ASK, BotState.SUMMARY, BotState.FEEDBACK], // NUEVO: puede volver a FEEDBACK (para Try Again)
    [BotState.SUMMARY]: [BotState.EXIT],
    [BotState.EXIT]: [],
  };

  canTransition(to: BotState): boolean {
    return this.allowedTransitions[this.currentState].includes(to);
  }

  transition(to: BotState): void {
    if (!this.allowedTransitions[this.currentState].includes(to)) {
      const errorMsg = `Invalid transition from ${this.currentState} to ${to}. Allowed: ${this.allowedTransitions[this.currentState].join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log(`✓ State transition: ${this.currentState} → ${to}`);
    this.currentState = to;
  }
}