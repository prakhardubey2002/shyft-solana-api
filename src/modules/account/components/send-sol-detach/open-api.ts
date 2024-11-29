import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function SendBalanceDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer wallet balance without private_key' }),
    ApiOkResponse({
      description: 'Transaction initiated successfully',
      schema: {
        example: {
          success: true,
          message: '1.2 SOL transfer request generated successfully',
          result: {
            encoded_transaction: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDmFWYteRvJYw2HIfGgUAbGCrz00zOc1fx/ASNo7oRmvYYyp9RxUce7b6XJTmDH3BTasbGTY2hJe2h0xJ16/4PFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiXMePKuHbfGvuCNhdcnwlC6az6BIpyvK+1yTRL9XhyABAgIAAQwCAAAAAIyGRwAAAAA=',
          },
        },
      },
    }),
  );
}
