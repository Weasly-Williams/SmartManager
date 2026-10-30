/// <reference types="jest" />
import { createAiAssistant, type AssistantTask, type ScheduleChange } from './aiAssistant.js';

const startTime = Date.parse('2026-11-02T15:00:00Z');
const endTime = Date.parse('2026-11-02T16:00:00Z');

function setup() {
  const tasks: AssistantTask[] = [
    { id: 1, userId: 'alice', title: 'Study', startTime, endTime },
    { id: 2, userId: 'alice', title: 'Review', startTime, endTime },
    { id: 3, userId: 'bob', title: 'Private appointment', startTime, endTime },
  ];
  const ai = { respond: jest.fn<Promise<unknown>, [unknown]>() };
  const repository = {
    // Deliberately include another user's task to exercise the service's ownership boundary.
    listForUser: jest.fn(async (_userId: string) => tasks.map(task => ({ ...task }))),
    updateSchedule: jest.fn(async (userId: string, taskId: number, change: ScheduleChange) => {
      const task = tasks.find(item => item.id === taskId && item.userId === userId);
      if (!task) throw new Error('Task not accessible');
      Object.assign(task, change);
    }),
  };
  return { tasks, ai, repository, assistant: createAiAssistant({ ai, tasks: repository }) };
}

const request = { userId: 'alice', prompt: 'Move my study task one hour later', mode: 'schedule' as const };
const reschedule = { type: 'reschedule', taskId: 1, startTime: startTime + 3600000, endTime: endTime + 3600000 };

describe('AI assistant — highest-priority unit tests', () => {
  test('user authorization: hides other users’ tasks and rejects unauthorized changes', async () => {
    const { assistant, ai, repository } = setup();
    await expect(assistant.respond({ ...request, userId: ' ' })).rejects.toThrow('Authentication required');
    expect(repository.listForUser).not.toHaveBeenCalled();
    expect(ai.respond).not.toHaveBeenCalled();

    ai.respond.mockResolvedValue({ ...reschedule, taskId: 3 });
    await expect(assistant.respond(request)).rejects.toThrow('Task not accessible');
    expect(repository.listForUser).toHaveBeenCalledWith('alice');
    expect(ai.respond).toHaveBeenCalledWith({
      prompt: request.prompt,
      tasks: [
        { id: 1, userId: 'alice', title: 'Study', startTime, endTime },
        { id: 2, userId: 'alice', title: 'Review', startTime, endTime },
      ],
    });
    expect(repository.updateSchedule).not.toHaveBeenCalled();
  });

  test('AI response validation: rejects malformed output, unsupported actions, and invented IDs', async () => {
    const { assistant, ai, repository } = setup();
    for (const value of [null, 'not JSON', [], {}, { type: 'delete', taskId: 1 },
      { type: 'advice', message: ' ' }, { type: 'reschedule', taskId: 1 },
      { ...reschedule, taskId: '1' }, { ...reschedule, taskId: 1.5 },
      { ...reschedule, startTime: 'tomorrow' }]) {
      ai.respond.mockResolvedValue(value);
      await expect(assistant.respond(request)).rejects.toThrow('Invalid AI response');
    }
    ai.respond.mockResolvedValue({ ...reschedule, taskId: 999 });
    await expect(assistant.respond(request)).rejects.toThrow('Task not accessible');
    expect(repository.updateSchedule).not.toHaveBeenCalled();
  });

  test('advice-only requests never write tasks, even when the AI proposes an action', async () => {
    const { assistant, ai, repository, tasks } = setup();
    const before = tasks.map(task => ({ ...task }));
    const adviceRequest = { ...request, prompt: 'How should I organize my study time?', mode: 'advice' as const };
    ai.respond.mockResolvedValue({ type: 'advice', message: 'Try short study sessions with breaks.' });
    await expect(assistant.respond(adviceRequest)).resolves.toEqual({
      type: 'advice', message: 'Try short study sessions with breaks.',
    });
    ai.respond.mockResolvedValue(reschedule);
    await expect(assistant.respond(adviceRequest)).rejects.toThrow('Scheduling is disabled in advice mode');
    expect(repository.updateSchedule).not.toHaveBeenCalled();
    expect(tasks).toEqual(before);
  });

  test('invalid scheduling changes reject nonexistent tasks, invalid dates, and nonpositive durations', async () => {
    const { assistant, ai, repository, tasks } = setup();
    const before = tasks.map(task => ({ ...task }));
    for (const change of [
      { startTime: NaN }, { endTime: Infinity }, { startTime: -Infinity },
      { startTime: 9e15 }, { endTime: 9e15 },
      { startTime: endTime, endTime }, { startTime: endTime + 1, endTime },
    ]) {
      ai.respond.mockResolvedValue({ ...reschedule, ...change });
      await expect(assistant.respond(request)).rejects.toThrow('Invalid schedule');
    }
    ai.respond.mockResolvedValue({ ...reschedule, taskId: 999 });
    await expect(assistant.respond(request)).rejects.toThrow('Task not accessible');
    expect(repository.updateSchedule).not.toHaveBeenCalled();
    expect(tasks).toEqual(before);
  });

  test('valid rescheduling updates only the selected task’s schedule for the authenticated user', async () => {
    const { assistant, ai, repository, tasks } = setup();
    const before = tasks.map(task => ({ ...task }));
    ai.respond.mockResolvedValue({ ...reschedule, userId: 'bob', title: 'Overwritten', priority: 'high' });
    await expect(assistant.respond(request)).resolves.toEqual(reschedule);
    expect(repository.updateSchedule).toHaveBeenCalledTimes(1);
    expect(repository.updateSchedule).toHaveBeenCalledWith('alice', 1, {
      startTime: reschedule.startTime, endTime: reschedule.endTime,
    });
    expect(tasks).toEqual([
      { ...before[0], startTime: reschedule.startTime, endTime: reschedule.endTime },
      before[1], before[2],
    ]);
  });
});

describe('AI assistant — remaining planned unit tests', () => {
  test.skip('prompt validation', function testPromptValidation() {
    // ToDo
  });
  test.skip('schedule generation respects availability, duration, and deadlines', function testScheduleGeneration() {
    // ToDo
  });
  test.skip('conflict detection flags overlapping or impossible schedules', function testConflictDetection() {
    // ToDo
  });
  test.skip('task prioritization follows priorities and deadlines', function testTaskPrioritization() {
    // ToDo
  });
  test.skip('ambiguous requests ask for clarification', function testAmbiguousRequests() {
    // ToDo
  });
  test.skip('AI and database failures do not report success or leave partial changes', function testFailureHandling() {
    // ToDo
  });
  test.skip('time zones, midnight, and daylight-saving transitions', function testTimeZonesAndDates() {
    // ToDo
  });
});
