import { ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function MintTokenOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Mint Token' }),
    ApiCreatedResponse({
      description: 'Token minted successfully',
      schema: {
        example: {
          success: true,
          message: 'Token minted successfully',
          result: {
            txhash: "4nCL9h3d761dYQcfo1Jb8ikeN9ydfUtrXeZh3sCbHE32s1LjHxQCJTTjcn7XXTLUTPj3GsfMHyeGngJ7yyeyd1ts",
          },
        },
      },
    }),
  );
}

export function MintTokenDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Mint Token without private_key' }),
    ApiCreatedResponse({
      description: 'Token mint request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Token mint request generated successfully',
          result: {
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDGMqfUcVHHu2+lyU5gx9wU2rGxk2NoSXtodMSdev+DxU149+BuHwrHyERE4lK+pDqz1cPOaPnPAO56DKHpPnPqQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGZ75+gzsF6WPLOQgC+tL75bEdK/l5cBP0MXH6KxOmXycBAgIBALwBDwEEAAAASG9sYQIAAABITFgAAABodHRwczovL25mdHN0b3JhZ2UubGluay9pcGZzL2JhZmtyZWlod2Vxd3lkd29iaG9yM2FzZjd1YWFocm5tc3c2cDdnNnh5cnl6a2p4dTJuM2ZrZ2d6dnd5BQABAQAAABjKn1HFRx7tvpclOYMfcFNqxsZNjaEl7aHTEnXr/g8VAWQAAAEYyp9RxUce7b6XJTmDH3BTasbGTY2hJe2h0xJ16/4PFQEAAQE=',
            mint: 'EAmTA4TiEPShWKgy3G1iYyco3suogTocZVVbAwqjoPKV',
          },
        },
      },
    }),
  );
}
