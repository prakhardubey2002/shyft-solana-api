  import {
    ApiOperation,
    ApiOkResponse,
  } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function BurnOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Burn NFT' }),
    ApiOkResponse({
        description: 'NFT burned successfully',
        schema: {
          example: {
            success: true,
            message: 'NFT burned successfully',
            result: {
              txId: 'T9xnfTpcZhzhT6UBjQKkD5bDXtw4agZw7btBGND6dTLJJKWhpE24a5BhsHVjmAU1eCCS9fqM6TZ8Hg2u4F2vXTM',
            },
          },
        },
      })
  );
}
