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
            txhash: '4qUvyoFd7dfbsdRWiXaTV9zdpCJS7ZAzXGQQET1cFcbaXJ1f539MnDbmKaGGxKDbaFjyJjSJ6UvDk5ytRPqfSPAb',
          },
        },
      },
    }),
  );
}
