import { ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function TransferTokenOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer Token' }),
    ApiCreatedResponse({
      description: 'Transfer Token successful',
      schema: {
        example: {
          success: true,
          message: 'Transfer token successful',
          result: {
            txhash: "4nCL9h3d761dYQcfo1Jb8ikeN9ydfUtrXeZh3sCbHE32s1LjHxQCJTTjcn7XXTLUTPj3GsfMHyeGngJ7yyeyd1ts",
          },
        },
      },
    }),
  );
}

export function TransferTokenDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer token without private_key' }),
    ApiCreatedResponse({
      description: 'Transfer token request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Transfer token request generated successfully',
          result: {
            encoded_transaction: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIFGMqfUcVHHu2+lyU5gx9wU2rGxk2NoSXtodMSdev+DxUx/xLUEkreCVwx/VT9oHEH5oA/YhKVEnKGWVRD4mVieD4tcOi9OU6097ok44hG1gMMWwE6s7vbFR0A9X0vfGgjAAx96vxgT3SNrsPeAaCQVb8NGhUcPxwFg4G8LRP7gzUG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqSQqc7GQ//4xhae+Bjm9OYWYMWcGklZGJnp0ilR2MQRFAQQEAgMBAAoMAOQLVAIAAAAJ',
          },
        },
      },
    }),
  );
}

