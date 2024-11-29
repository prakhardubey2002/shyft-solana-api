import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function PrintNftEditionOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Mint NFT From Master Edition' }),
    ApiOkResponse({
      description: 'NFT Edition printed successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT Edition printed successfully',
          result: {
            mint: '4CFLGuG4C77iZCr2AHeSKPp4b6PAowtQ9jJhXdmCdZYW',
            txId: '4JXQiKHxW6a2u3QcvbBNWPoJppUFRGwTMVXtzmRFRsfTmyGMKSYRes3tyxQMHvgPeFMLo7R1QxthTbubeuVMv31t',
          },
        },
      },
    }),
  );
}

export function PrintNftEditionDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Mint NFT From Master Edition without private_key' }),
    ApiOkResponse({
      description: 'NFT Edition mint request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT Edition mint request generated successfully',
          result: {
            encoded_transaction:
              'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADd/kZ7nuc7bHY1UZVoVPsZ2Slp+9Sz9dwdHYG7/EP0XTgUn5L1oPWrbCiWyhASqoz4vROwbl2Neo1exHuYvnYIAgAID0mioYxx/rk7c0Sls7U3Uq1cPiWEWioadmJJkpfEpJj1IRPDYHVKLFdzmKAhEV5ABsw3PbAIcv3yNkm3z5V2dA0oNsKtkdrxCZh81eIaZc6sHtpoVRDXqCwk2sxG3tUhDS4Opo80GCvyIr4gr+MfwhU03cnO9eEM/I2BvSTn8atGSgv4jEnlxkrsXIO3WpLa65+YPE+hVbcdZfoTSlkuSZace5SwBw7BnI9z9u9hPXYCyNkAAWPPPEqUQJe24xjrsbmyqqUL4gQg6etSyylLP4PMcsG5bcYK4xg9sKxkzNEVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYyp9RxUce7b6XJTmDH3BTasbGTY2hJe2h0xJ16/4PFYyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZzgOeiS4FIAsM7m2Xp1OR42r2qbdt9WblPm7k6dy0XkQLcGWx49F8RTidUn9rBMPNWLhscxqg/bVJttG8A/gpRgan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAABt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKkOmNc6v7OEyaYVVIa6Sv4A/AgVM+wz147I5bRZEbS74yKOCI5qZRvBPiwWe60BzPA23jIRrCRiPj2oAj/VJbo9BQcCAAE0AAAAAGBNFgAAAAAAUgAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQ0CAQxDAABJoqGMcf65O3NEpbO1N1KtXD4lhFoqGnZiSZKXxKSY9QFJoqGMcf65O3NEpbO1N1KtXD4lhFoqGnZiSZKXxKSY9QkHAAMIAQcNDAANAwEDAAkHAQAAAAAAAAALDgYFAgEEAAAADggKDQcMCQsCAAAAAAAAAA==',
            mint: 'D3DWxLFj3LHXcTHFcN7DDXyxFNEJuXsKDukmrfos5H9R',
          },
        },
      },
    }),
  );
}
