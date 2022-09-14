import { HttpStatus } from '@nestjs/common';
import { newProgramError, ProgramError } from './program-error';

describe('test getMessage', () => {
  let pError: ProgramError;

  it('should print message', () => {
    const inputMsg = 'this is a test error';
    pError = newProgramError('testError', HttpStatus.BAD_REQUEST, inputMsg);
    const msg = pError.getMessage();
    console.log(msg);
    expect(msg).toBe(inputMsg);
  });

  it('should log a message properly', () => {
    pError = newProgramError(
      'testError2',
      HttpStatus.FORBIDDEN,
      'this is a test message',
      'detailed error string for the debugging',
      'programError_testCase2',
      {
        this: 'is an error',
        tester: 'vg',
      },
    );
    const msg = pError.log();
    expect(msg).toContain('code');
  });
});
