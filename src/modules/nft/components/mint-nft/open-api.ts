import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function PrintNftEditionOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Mint NFT From Master Edition' }),
    ApiOkResponse({
      description: 'NFT Edition minted successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT Edition minted successfully',
          result: {
            mint: "D3DWxLFj3LHXcTHFcN7DDXyxFNEJuXsKDukmrfos5H9R",
            txId: "RBCcM2XKSBEwkNbdBkEPfCVGKfqyu1gxiUGkmzQsef9yhMoTip9cARY2gr9zgH6Hr7QdCDD6KDvjfxCWdVZNqTc"
          },
        },
      },
    }),
  );
}
