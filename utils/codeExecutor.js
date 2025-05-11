const { VM } = require('vm2');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Execute JavaScript code
// const executeJavaScript = async (code, testCase) => {
//   const results = [];

//   try {
//     const inputParams = JSON.parse(testCase.input);

//     const wrappedCode = `
//       const solution = ${code};
//       const result = solution(...${JSON.stringify(inputParams)});
//       result;  // Ensure the return value is returned properly
//     `;

//     const start = performance.now();
//     const actualOutput = eval(wrappedCode);  // Could throw
//     const end = performance.now();

//     // Ensure the actualOutput is serialized to JSON before comparing
//     results.push({
//       expected: testCase.output,
//       actual: JSON.stringify(actualOutput),  // Stringify the output
//       passed: JSON.stringify(actualOutput) === testCase.output,
//       executionTime: (end - start).toFixed(2),
//     });

//   } catch (error) {
//     results.push({
//       expected: testCase.output,
//       actual: '',
//       passed: false,
//       executionTime: null,
//       error: error.message || 'Code execution failed'
//     });
//   }

//   return results;
// };

// const executeJavaScript = async (code, testCase) => {
//   const results = [];

//   try {
//     const inputParams = JSON.parse(testCase.input);
//     const expectedOutput = JSON.parse(testCase.output);  // 👈

//     const wrappedCode = `
//   const solution = ${code};
//   solution(${JSON.stringify(inputParams.length === 1 ? inputParams[0] : inputParams)});
// `;

//     const start = performance.now();
//     const actualOutput = eval(wrappedCode);  // Could throw
//     const end = performance.now();

//     const isCorrect = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);  // 👈 compare values

//     results.push({
//       expected: JSON.stringify(expectedOutput),
//       actual: JSON.stringify(actualOutput),
//       passed: isCorrect,
//       executionTime: (end - start).toFixed(2),
//     });

//   } catch (error) {
//     results.push({
//       expected: testCase.output,
//       actual: '',
//       passed: false,
//       executionTime: null,
//       error: error.message || 'Code execution failed'
//     });
//   }

//   return results;
// };

// const executeJavaScript = async (code, testCase) => {
//   const results = [];

//   try {
//     const inputParams = JSON.parse(testCase.input);
//     const expectedOutput = JSON.parse(testCase.output);

//     const wrappedCode = `
//       const solution = ${code};
//       solution(${JSON.stringify(inputParams.length === 1 ? inputParams[0] : inputParams)});
//     `;

//     const start = performance.now();
//     const actualOutput = eval(wrappedCode); // execute user's function
//     const end = performance.now();

//     const actualJSON = JSON.stringify(actualOutput);
//     const expectedJSON = JSON.stringify(expectedOutput);

//     const isCorrect = actualJSON === expectedJSON;

//     results.push({
//       expected: expectedJSON,
//       actual: actualJSON,
//       passed: isCorrect,
//       executionTime: (end - start).toFixed(2),
//     });

//   } catch (error) {
//     results.push({
//       expected: testCase.output,
//       actual: `"${error.message}"`,
//       passed: false,
//       executionTime: null,
//       error: error.message || 'Code execution failed',
//     });
//   }

//   return results;
// };

const executeJavaScript = async (code, testCase) => {
  const results = [];

  try {
    // Safely parse input and output if they're strings, or use them directly if they're objects
    let inputParams;
    let expectedOutput;
    
    try {
      // If testCase.input is a string, parse it as JSON
      inputParams = typeof testCase.input === 'string' 
        ? JSON.parse(testCase.input) 
        : testCase.input;
        
      // If testCase.output is a string, parse it as JSON
      expectedOutput = typeof testCase.output === 'string' 
        ? JSON.parse(testCase.output) 
        : testCase.output;
    } catch (parseError) {
      return [{
        expected: testCase.output,
        actual: `"Error parsing test case: ${parseError.message}"`,
        passed: false,
        executionTime: null,
        error: `Error parsing test case: ${parseError.message}`
      }];
    }

    const wrappedCode = `
      const solution = ${code};
      solution(${JSON.stringify(inputParams.length === 1 ? inputParams[0] : inputParams)});
    `;

    const start = performance.now();
    const actualOutput = eval(wrappedCode); // execute user's function
    const end = performance.now();

    const actualJSON = JSON.stringify(actualOutput);
    const expectedJSON = JSON.stringify(expectedOutput);

    const isCorrect = actualJSON === expectedJSON;

    results.push({
      expected: expectedJSON,
      actual: actualJSON,
      passed: isCorrect,
      executionTime: (end - start).toFixed(2),
    });

  } catch (error) {
    results.push({
      expected: typeof testCase.output === 'string' ? testCase.output : JSON.stringify(testCase.output),
      actual: `"${error.message}"`,
      passed: false,
      executionTime: null,
      error: error.message || 'Code execution failed',
    });
  }

  return results;
};

// Execute Python code
const executePython = (code, testCase) => {
  const input = JSON.parse(testCase.input);
  const inputStr = JSON.stringify(input);

  const startTime = process.hrtime();
  const pythonProcess = spawnSync('python3', ['-c', code], {
    input: inputStr,
    encoding: 'utf-8'
  });
  const endTime = process.hrtime(startTime);
  const executionTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);

  if (pythonProcess.error) {
    return {
      passed: false,
      error: pythonProcess.error.message,
      executionTime: null
    };
  }

  try {
    const result = JSON.parse(pythonProcess.stdout.trim());  // Ensure it's valid JSON
    const expected = JSON.parse(testCase.output);
    const isCorrect = JSON.stringify(result) === JSON.stringify(expected);

    return {
      passed: isCorrect,
      expected: JSON.stringify(expected),
      actual: JSON.stringify(result),  // Ensure it's serialized to JSON
      executionTime
    };
  } catch (error) {
    return {
      passed: false,
      error: "Output parsing failed",
      executionTime
    };
  }
};

// Execute Java code
const executeJava = (code, testCase) => {
  const tempFilePath = path.join(__dirname, 'TempSolution.java');
  fs.writeFileSync(tempFilePath, code);

  const compileProcess = spawnSync('javac', [tempFilePath]);
  if (compileProcess.error) {
    return {
      passed: false,
      error: compileProcess.error.message,
      executionTime: null
    };
  }

  const runProcess = spawnSync('java', ['TempSolution']);
  if (runProcess.error) {
    return {
      passed: false,
      error: runProcess.error.message,
      executionTime: null
    };
  }

  const result = runProcess.stdout.toString().trim();
  const expected = testCase.output;
  const isCorrect = result === expected;

  return {
    passed: isCorrect,
    expected,
    actual: result,  // Ensure result is in expected format
    executionTime: 'N/A'
  };
};

// Main executor function
const executeCode = async (code, testCases, language) => {
  const results = [];

  for (const testCase of testCases) {
    let result = [];

    try {
      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code, testCase);
          break;
        case 'python':
          result = [await executePython(code, testCase)];
          break;
        case 'java':
          result = [await executeJava(code, testCase)];
          break;
        default:
          result = [{ passed: false, error: 'Unsupported language' }];
      }

      const r = result[0]; // we assume one testCase at a time

      results.push({
        testCaseId: testCase._id,
        input: testCase.isHidden ? '[hidden]' : testCase.input,
        expected: testCase.isHidden ? '[hidden]' : r.expected,
        actual: testCase.isHidden ? '[hidden]' : (r.actual || r.error),
        passed: r.passed,
        executionTime: r.executionTime,
      });

    } catch (err) {
      console.error("Execution failed:", err.message);
      results.push({
        testCaseId: testCase._id,
        input: '[error]',
        expected: '[error]',
        actual: err.message,
        passed: false,
        executionTime: null
      });
    }
  }

  if (!results || results.length === 0) {
    throw new Error('Invalid or empty result array');
  }

  const allPassed = results.every(r => r.passed);
  const avgExecutionTime = results
    .filter(r => r.executionTime)
    .reduce((sum, r) => sum + parseFloat(r.executionTime), 0) / results.length;

  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    testResults: results,
    executionTime: avgExecutionTime.toFixed(2),
    memoryUsage: null
  };
};

module.exports = { executeCode };