import { ApiOperation, ApiConsumes, ApiCreatedResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function CreateNftDetachOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create NFT' }),
    ApiConsumes('multipart/form-data'),
    ApiCreatedResponse({
      description: 'Master Edition NFT request generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Master Edition NFT request generated successfully',
          result: {
            encoded_transaction:
              'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAldGYzMy4Xv0KP065dl1HWnb90C9FthTdcolNsF5DvzwzHC/7BhNrdIYY4EkacnaiOBGTV4HhME1517puF8BEAAgAFCZhVmLXkbyWMNhyHxoFAGxgq89NMznNX8fwEjaO6EZr2b1OhVeTUw35X8jRQYT7rxiegeahsQuKcG4mDGuyg3zYmtkh29x4mikwjqmEd6q4eNkATo0mXzZ45dvIEZbmeHLGjxW+KIsgZOj5zP8Rm9nkCgq6qVLUPgpTJAu/fkgdLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGBqfVFxksXFEhjMlMPUrxf1ja7gibof1E49vZigAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqdxhTt6GCSiQ3JHucZz/uhQiK9B0WBMzRhynj/kIHNENBQQCAAE0AAAAAGBNFgAAAAAAUgAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQgCAQdDAACYVZi15G8ljDYch8aBQBsYKvPTTM5zV/H8BI2juhGa9gGYVZi15G8ljDYch8aBQBsYKvPTTM5zV/H8BI2juhGa9gUHAAIAAQQIBwAIAwECAAkHYE0WAAAAAAAGBwMBAAAABAehARANAAAAVW5pcXVlIE1vbmtleQMAAABVTk1YAAAAaHR0cHM6Ly9uZnRzdG9yYWdlLmxpbmsvaXBmcy9iYWZrcmVpZzM0bmNkNDZuaWl2eHNnaGEzd3I3YzY3ZmszNXptZnhpdGtocjZrYmppb2xrc2k0NXpidfQBAQEAAACYVZi15G8ljDYch8aBQBsYKvPTTM5zV/H8BI2juhGa9gFkAAAB',
            mint: 'BjbzeuoZYn5UYduxRq2MAcT8MNdWKsZjaTR22uEKc5T',
          },
        },
      },
    }),
  );
}
