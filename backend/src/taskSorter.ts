export interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
}

// A clear, testable algorithm function that orders tasks by priority weight
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityWeights = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
}
