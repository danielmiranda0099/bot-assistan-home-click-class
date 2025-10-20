export interface OpenAIFeedback {
  score: number;
  decision: string;
  criteria: {
    semanticRelevance: number;
    grammaticalCorrectness: number;
    vocabularyAppropriate: number;
    pronunciation: number;
  };
  feedback: string;
  corrections: string | null;
  tips: string;
}

export class OpenAIService {
  private apiKey: string;
  private assistantId: string;

  constructor(apiKey: string, assistantId: string) {
    this.apiKey = apiKey;
    this.assistantId = assistantId;
  }

  async createThread(): Promise<any> {
    const res = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      throw new Error(`createThread failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async addMessageToThread(threadId: string, text: string): Promise<any> {
    const url = `https://api.openai.com/v1/threads/${threadId}/messages`;
    const body = {
      role: "user",
      content: text,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`addMessageToThread failed: ${res.status} ${txt}`);
    }
    return res.json();
  }

  async createRun(threadId: string): Promise<any> {
    const url = `https://api.openai.com/v1/threads/${threadId}/runs`;
    const body = {
      assistant_id: this.assistantId,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`createRun failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async getRunStatus(threadId: string, runId: string): Promise<any> {
    const url = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });
    if (!res.ok) {
      throw new Error(`getRunStatus failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async getMessages(threadId: string): Promise<any> {
    const url = `https://api.openai.com/v1/threads/${threadId}/messages`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });
    if (!res.ok) {
      throw new Error(`getMessages failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async getFeedback(activityPayload: any): Promise<OpenAIFeedback> {
    const thread = await this.createThread();
    const promptText = this.buildPrompt(activityPayload);
    await this.addMessageToThread(thread.id, promptText);
    const run = await this.createRun(thread.id);

    // Poll for completion
    let runStatus;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
      runStatus = await this.getRunStatus(thread.id, run.id);

      if (runStatus.status === "completed") {
        const messages = await this.getMessages(thread.id);
        const assistantMessages = messages.data.filter((m: any) => m.role === "assistant");

        if (assistantMessages.length > 0) {
          const rawContent = assistantMessages[0].content[0].text.value;
          let jsonString = rawContent.trim();

          // Remove markdown code blocks if present
          if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          try {
            const parsed = JSON.parse(jsonString);

            // Basic validation of expected structure
            if (typeof parsed.score === 'number' &&
                typeof parsed.decision === 'string' &&
                typeof parsed.feedback === 'string') {
              return parsed;
            } else {
              throw new Error('Parsed response missing required fields');
            }
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Raw content received:', rawContent);
            console.error('Cleaned JSON string:', jsonString);
            throw new Error('Invalid JSON response from OpenAI assistant');
          }
        } else {
          throw new Error("No assistant messages found");
        }
      } else if (runStatus.status === "failed") {
        throw new Error(`Run failed: ${runStatus.last_error?.message || "unknown"}`);
      } else if (runStatus.status === "expired") {
        throw new Error("Run expired");
      }
    }

    throw new Error("Timeout waiting for assistant response");
  }

  async getGeneralFeedback(activityPayload: any): Promise<any> {
    const thread = await this.createThread();
    const promptText = this.buildGeneralFeedbackPrompt(activityPayload);
    await this.addMessageToThread(thread.id, promptText);
    const run = await this.createRun(thread.id);

    // Same polling logic as getFeedback
    let runStatus;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
      runStatus = await this.getRunStatus(thread.id, run.id);

      if (runStatus.status === "completed") {
        const messages = await this.getMessages(thread.id);
        const assistantMessages = messages.data.filter((m: any) => m.role === "assistant");

        if (assistantMessages.length > 0) {
          const rawContent = assistantMessages[0].content[0].text.value;
          let jsonString = rawContent.trim();

          if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          }

          return JSON.parse(jsonString);
        }
      } else if (runStatus.status === "failed" || runStatus.status === "expired") {
        throw new Error("Run failed or expired");
      }
    }

    throw new Error("Timeout waiting for general feedback");
  }

  private buildPrompt(obj: any): string {
    return `
# Evaluación y Feedback de Respuestas - Asistente de Inglés

Eres un experto evaluador pedagógico de inglés especializado en proporcionar feedback constructivo y preciso para estudiantes. Tu tarea es evaluar respuestas de estudiantes y generar feedback útil, específico y motivador.

## CONTEXTO DE LA ACTIVIDAD
**Título**: ${obj.ACTIVITY_TITLE}
**Nivel**: ${obj.ACTIVITY_LEVEL}
**Contexto**: ${obj.ACTIVITY_CONTEXT}
**Descripción**: ${obj.ACTIVITY_DESCRIPTION}

## INFORMACIÓN DE LA PREGUNTA
**ID**: ${obj.QUESTION_ID}
**Pregunta**: ${obj.QUESTION_TEXT}
**Tipo**: ${obj.QUESTION_TYPE}
**Puntos de Evaluación**: ${obj.EVALUATE_POINTS}
**Pista Disponible**: ${obj.HINT_TEXT}

## RESPUESTA DEL ESTUDIANTE
**Input del Usuario**: ${obj.USER_INPUT}
**Pistas Usadas**: ${obj.HINT_USED}
**Tiempo Empleado**: ${obj.TIME_SPENT} segundos

Evalúa ahora la respuesta del estudiante siguiendo las directrices proporcionadas.
Por favor responde ÚNICAMENTE en el formato JSON especificado en las instrucciones del system prompt del assistant.
    `;
  }

  private buildGeneralFeedbackPrompt(accumulator: any): string {
    return JSON.stringify(accumulator, null, 2);
  }
}