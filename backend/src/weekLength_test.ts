function weekLength(): number {
  return 7;
}

function runTests() {
  console.log('Running TestWeekLength...');

  // Correct / Standard Case
  console.assert(weekLength() === 7, 'Expected weekLength() to be 7');

  // Incorrect Case
  console.assert(weekLength() !== 5, 'weekLength() should not be 5');
  console.assert(weekLength() !== 8, 'weekLength() should not be 8');

  // Edge Cases
  const result = weekLength();
  console.assert(typeof result === 'number', 'Expected return type to be number');
  console.assert(Number.isInteger(result), 'Expected result to be an integer');
  console.assert(result > 0, 'Expected result to be greater than 0');

  console.log('All tests passed!');
}

runTests();