import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function BurnTokenOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Burn Token' }),
    ApiOkResponse({
      description: 'Token burned successfully',
      schema: {
        example: {
          success: true,
          message: 'Token burned successfully',
          result: {
            txId: '4qUvyoFd7dfbsdRWiXaTV9zdpCJS7ZAzXGQQET1cFcbaXJ1f539MnDbmKaGGxKDbaFjyJjSJ6UvDk5ytRPqfSPAb',
            mint: 'DYitxNvtLxEsn2SChFfHMTCHhcZHgGhFnZeP8zSCof1X',
            metadata: '8hiAPEukZfWi7sMqZfzyNTmXyR4iGmLb5Z3QNz7CMXe3',
            edition: '9tV1QAsnbDtuvwZDpukoQzaJds7jHenXHZ5bRCrJ1gnU',
          },
        },
      },
    }),
  );
}
