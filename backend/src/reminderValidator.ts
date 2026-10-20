export function setReminder(reminderOffset: number): boolean {
  // Equivalence Partition Boundary Rules
  if (reminderOffset < 0) return false;         // Invalid Low
  if (reminderOffset > 1440) return false;      // Invalid High
  return true;                                 // Valid range
}
