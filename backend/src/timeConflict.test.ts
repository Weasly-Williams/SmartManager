
import { describe, test, expect } from '@jest/globals';
import { timeConflict } from './timeConflict.js';

describe('TestTimeConflict', () => {

    // Correct Cases
    test('test_overlapping_tasks', () => {
        expect(timeConflict([
            { startTime: 9, endTime: 11 },
            { startTime: 10, endTime: 12 }
        ])).toBe(true);
    });

    test('test_non_overlapping_tasks', () => {
        expect(timeConflict([
            { startTime: 9, endTime: 10 },
            { startTime: 11, endTime: 12 }
        ])).toBe(false);
    });

    // Incorrect Case
    test('test_invalid_time_interval', () => {
        expect(timeConflict([
            { startTime: 12, endTime: 10 }
        ])).toBe(false);
    });

    // Boundary Conditions
    test('test_tasks_meet_at_endpoint', () => {
        expect(timeConflict([
            { startTime: 9, endTime: 10 },
            { startTime: 10, endTime: 11 }
        ])).toBe(false);
    });

    test('test_one_minute_overlap', () => {
        expect(timeConflict([
            { startTime: 9, endTime: 10 },
            { startTime: 9 + 59 / 60, endTime: 11 }
        ])).toBe(true);
    });

    // Edge Cases
    test('test_identical_intervals', () => {
        expect(timeConflict([
            { startTime: 9, endTime: 10 },
            { startTime: 9, endTime: 10 }
        ])).toBe(true);
    });

    test('test_task_inside_another_task', () => {
        expect(timeConflict([
            { startTime: 9, endTime: 12 },
            { startTime: 10, endTime: 11 }
        ])).toBe(true);
    });

    test('test_empty_task_list', () => {
        expect(timeConflict([])).toBe(false);
    });

});
