/** Framework-independent foundation; HTTP, authentication, and provider adapters are not wired yet. */
export interface AssistantTask {
  id: number;
  userId: string;
  title: string;
  startTime: number;
  endTime: number;
}

export interface ScheduleChange {
  startTime: number;
  endTime: number;
}

export interface AssistantDependencies {
  ai: {
    respond(input: { prompt: string; tasks: AssistantTask[] }): Promise<unknown>;
  };
  tasks: {
    listForUser(userId: string): Promise<AssistantTask[]>;
    // The adapter must enforce ownership atomically in its UPDATE query.
    updateSchedule(userId: string, taskId: number, change: ScheduleChange): Promise<void>;
  };
}

type AssistantResponse =
  | { type: 'advice'; message: string }
  | { type: 'reschedule'; taskId: number; startTime: number; endTime: number };

function parseResponse(value: unknown): AssistantResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid AI response');
  }
  const response = value as Record<string, unknown>;
  if (response.type === 'advice' && typeof response.message === 'string' && response.message.trim()) {
    return { type: 'advice', message: response.message };
  }
  if (response.type === 'reschedule' && Number.isSafeInteger(response.taskId) &&
      typeof response.startTime === 'number' && typeof response.endTime === 'number') {
    return {
      type: 'reschedule', taskId: response.taskId as number,
      startTime: response.startTime, endTime: response.endTime,
    };
  }
  throw new Error('Invalid AI response');
}

export function createAiAssistant(dependencies: AssistantDependencies) {
  return {
    async respond(request: { userId: string; prompt: string; mode: 'advice' | 'schedule' }) {
      // userId must come from authenticated server context, never from the AI or request body.
      if (!request.userId.trim()) throw new Error('Authentication required');
      if (request.mode !== 'advice' && request.mode !== 'schedule') throw new Error('Invalid assistant mode');
      const tasks = (await dependencies.tasks.listForUser(request.userId))
        .filter(task => task.userId === request.userId);
      const response = parseResponse(await dependencies.ai.respond({ prompt: request.prompt, tasks }));
      if (response.type === 'advice') return response;
      if (request.mode === 'advice') throw new Error('Scheduling is disabled in advice mode');
      if (!tasks.some(task => task.id === response.taskId)) throw new Error('Task not accessible');
      if (!Number.isFinite(response.startTime) || !Number.isFinite(response.endTime) ||
          !Number.isFinite(new Date(response.startTime).getTime()) ||
          !Number.isFinite(new Date(response.endTime).getTime()) ||
          response.endTime <= response.startTime) {
        throw new Error('Invalid schedule');
      }
      await dependencies.tasks.updateSchedule(request.userId, response.taskId, {
        startTime: response.startTime,
        endTime: response.endTime,
      });
      return response;
    },
  };
}
