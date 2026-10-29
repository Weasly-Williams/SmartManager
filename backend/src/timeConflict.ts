
export interface Task {
    startTime: number;
    endTime: number;
}

export function timeConflict(taskList: Task[]): boolean {
    // Check every pair of tasks
    for (let i = 0; i < taskList.length; i++) {
        for (let j = i + 1; j < taskList.length; j++) {

            const task1 = taskList[i];
            const task2 = taskList[j];

            // Check whether the tasks overlap
            if (
                task1.startTime < task2.endTime &&
                task2.startTime < task1.endTime
            ) {
                return true;
            }
        }
    }

    return false;
}
