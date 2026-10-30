import { describe, test, expect } from '@jest/globals';
import { setReminder } from './reminderValidator.js';

describe('TestSetReminder', () => {

test('test_valid_reminder_offset', () => {
expect(setReminder(30)).toBe(true);
});


test('test_invalid_reminder_offset', () => {
expect(setReminder(-15)).toBe(false);
});

test('test_boundary_max_valid_offset', () => {
    expect(setReminder(1440)).toBe(true);
});

test('test_edge_exceeding_max_offset', () => {
    expect(setReminder(1441)).toBe(false);
});

});