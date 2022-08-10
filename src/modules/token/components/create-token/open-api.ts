import { ApiOperation, ApiCreatedResponse, ApiConsumes } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function CreateTokenOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Token' }),
    ApiConsumes('multipart/form-data'),
    ApiCreatedResponse({
      description: 'Token created successfully',
      schema: {
        example: {
          success: true,
          message: 'Token created successfully',
          result: {
            txhash: "3j7CrPu3DMp6SMPS6YbML4WMd3c5v2kXDraSYLrqHWbZTCApwdSgWc7RbWnvLMSu8MjFe7FEbQHuPuHScLo4STdb",
            token_address: "EAmTA4TiEPShWKgy3G1iYyco3suogTocZVVbAwqjoPKV",
          },
        },
      },
    }),
  );
}

export function CreateTokenDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Token without private_key' }),
    ApiConsumes('multipart/form-data'),
    ApiCreatedResponse({
      description: 'Token create request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Token create request generated successfully',
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
