/// <reference types="jest" />
import { sortTasksByPriority, Task } from './taskSorter.js';

describe('Backend Task Sorter Baseline Tests', () => {
  test('should sort tasks correctly from high to low priority', () => {
    const mockTasks: Task[] = [
      { id: 1, title: 'Low Priority Task', priority: 'low' },
      { id: 2, title: 'High Priority Task', priority: 'high' },
      { id: 3, title: 'Medium Priority Task', priority: 'medium' }
    ];

    const sortedResult = sortTasksByPriority(mockTasks);

    expect(sortedResult[0].priority).toBe('high');
    expect(sortedResult[0].title).toBe('High Priority Task');
  });
});