import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function TransferOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer NFT' }),
    ApiOkResponse({
      description: 'NFT Transfer',
      schema: {
        example: {
          success: true,
          message: 'NFT Transfer successful',
          result: {
            txId: '5NjF2pzAjE9cJq3xfBsVLf9GYWJRdQqgQ3u6k27CtHKwKr6Mh5zqhVgujqfxYEy6LwWNNahyzsk1zYDhEE8a1jqN',
          },
        },
      },
    }),
  );
}

export function TransferDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer NFT without private_key' }),
    ApiOkResponse({
      description: 'NFT Transfer request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT Transfer request generated successfully',
          result: {
            encoded_transaction:
              '5NjF2pzAjE9cJq3xfBsVLf9GYWJRdQqgQ3u6k27CtHKwKr6Mh5zqhVgujqfxYEy6LwWNNahyzsk1zYDhEE8a1jqN',
          },
        },
      },
    }),
  );
}

export function TransferMultipleNftsOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer Multiple NFTs' }),
    ApiOkResponse({
      description: 'Transfer NFTs request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Transfer NFTs request generated successfully',
          result: {
            encoded_transactions: [
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAgXmFWYteRvJYw2HIfGgUAbGCrz00zOc1fx/ASNo7oRmvYQiskPs328pq98o+DEy686aOD14VixqoR+4FrvxidjVCjwQtBpA8CM/AXQhvkOVak0NtpYmXuupVsNkDKvuN1xNRg7AMG31LVJGAzzHMlwj9H1PRS1vsOHrtKxq40SIeI5rEFk5fw0INxpainHGzBqvWyh1YDZGr4Xv7EmPyayjGErJarBbiRT1YbyJVosT8nxiI6DgC9pcq70LGsg15fXchEhfrnpKPkU87s9L9qwEezz4yUH5O4HVlcO/CKt/vNyeyxpED2SiFMEU+rckzjVdQdjCDtVbMzmq9neYpfl34d1J27GRoEWlOgDNeda8JVQUrUxWaYf2aZivApMLeYZpidMoRFeL6kolIu2zHC/yDjrM/5xwG9drjYjbIxYEk2tWjgRNFQiONVbqSqAXcDA21i2GqTmTt3ugUk80RAZ87Az4xUYCrJVjKa1jvbCkZMRR6eH7m0WwpNcJBxa5NC1vZKXY/3U52jAMfVZbSJAixgDBRlqOaAY/xidHlMXT0vOy+1sLd+xIO/s5n3qK+1oH75Y2GY/Ri5+0nzVCIptywzYFIT/d/D3mCKnSLrlc2qrsA11t6ezrY+uNeD3Yz4OUJLsktlB97dJSHFv0A/y6jmvRO/nKcLhGs8maLCe2td0JK9WSiHFj1SN2JFvoZ7VgfmoUng3v6uOaKR3LS7c1oBnBTtuEdGAyNzPAi3nE2mQue4v9eNyPtDU5scy4jsDkSjjTYe4/TRib6+sDjVSq/PX5xq41i32P/JF7HLZjXSnwJRoRCDZ5iZm+kmo2ZeZHJ3ULslOOE0DZouGzd+cRdapRMRTBvim0715o9HoiofGSyNRrZ2Ep/FbdSgc+ZBg4rQ8qsFucVFrSsDPy81rUFhVF1P8C3j79c/tEKWYV/EG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqZY82A2RXG+xVIQ9I1jl6H8BY6mV7imjnI4CL08lKV1JBxYECxUEAAoMAQAAAAAAAAAAFgQOEAYACgwBAAAAAAAAAAAWBAwPCQAKDAEAAAAAAAAAABYEBxMNAAoMAQAAAAAAAAAAFgQBEQoACgwBAAAAAAAAAAAWBAUSCAAKDAEAAAAAAAAAABYEAxQCAAoMAQAAAAAAAAAA',
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAYJmFWYteRvJYw2HIfGgUAbGCrz00zOc1fx/ASNo7oRmvZKDXGXhW+BZEExfPS0cQBb+3nbBrm5wyHPq9MjUGsXkJECfH+dmCEA4huOvr/8uaacMJDiqV68ot4abUZJhe+eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYyp9RxUce7b6XJTmDH3BTasbGTY2hJe2h0xJ16/4PFYyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZsZx4v+/doZSL4ttPpDh74U9JRmsiX+6B+F37uICN1tUGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpXC01Y5njZGkKfOwXEnuyFJw6YJjfOOBidmCGaGHvBowCBQcAAQQGAwgHAAgEAgYBAAoMAQAAAAAAAAAA',
            ],
          },
        },
      },
    }),
  );
}
