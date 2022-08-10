import { ApiOperation, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function UpdateOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Update NFT' }),
    ApiConsumes('multipart/form-data'),
    ApiOkResponse({
      description: 'NFT updated',
      schema: {
        example: {
          success: true,
          message: 'NFT updated',
          result: {
            txId: '5NjF2pzAjE9cJq3xfBsVLf9GYWJRdQqgQ3u6k27CtHKwKr6Mh5zqhVgujqfxYEy6LwWNNahyzsk1zYDhEE8a1jqN',
          },
        },
      },
    }),
  );
}

export function UpdateDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Update NFT without private_key' }),
    ApiConsumes('multipart/form-data'),
    ApiOkResponse({
      description: 'NFT update request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT update request generated successfully',
          result: {
            encoded_transaction: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDGMqfUcVHHu2+lyU5gx9wU2rGxk2NoSXtodMSdev+DxU149+BuHwrHyERE4lK+pDqz1cPOaPnPAO56DKHpPnPqQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGZ75+gzsF6WPLOQgC+tL75bEdK/l5cBP0MXH6KxOmXycBAgIBALwBDwEEAAAASG9sYQIAAABITFgAAABodHRwczovL25mdHN0b3JhZ2UubGluay9pcGZzL2JhZmtyZWlod2Vxd3lkd29iaG9yM2FzZjd1YWFocm5tc3c2cDdnNnh5cnl6a2p4dTJuM2ZrZ2d6dnd5BQABAQAAABjKn1HFRx7tvpclOYMfcFNqxsZNjaEl7aHTEnXr/g8VAWQAAAEYyp9RxUce7b6XJTmDH3BTasbGTY2hJe2h0xJ16/4PFQEAAQE=',
          },
        },
      },
    }),
  );
}
