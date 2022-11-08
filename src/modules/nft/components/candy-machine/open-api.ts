import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function GetAllMintsResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all mints on a perticular candy machine' }),
    ApiOkResponse({
      description: 'Get all mints on a perticular candy machine',
      schema: {
        example: {
          success: true,
          message: 'All NFTs minted on this candy machine address: H2oYLkXdkX38eQ6VTqs26KAWAvEpYEiCtLt4knEUJxpu',
          result: [
            '537d3MhYLiYemihaWH1PQLvUhnBpMJRLjnTVrJEAWnAW',
            'HBXeDf9V77DCo6dMFbL4vUfThF7rb1oUZewE9eYZP1he',
            '6tCgReRPbcjd5ECA9K8H4bvEYD7NDyLNpYQxwV6Adtte',
            '5GdJvUMRHVH3HJWysRrtTLikT1VyaVSb2juua1CED1NZ',
            'E4WDXow3nHddYfZiM2mRm28FAg1BuLRiN9BJv6w3sz5P',
            '5yUJWuk4t4F7ky9waTf82YkaZ9sgcKTDLa2iMKfFMXt7',
            'EEiULcyM7rtzp3HjvDWj3ZRDn8Ux63J32chr2fPjnnZY',
            'GmVdwW7qQXrJpf52v244uLZxmPB4DRhsUdxtHK4HHaGe',
            '315ZpYFNUNC3JFLCebvzNS6czPYe2aunub5UMb1Bfw3J',
            'FvhJiSHBA415LC293uWhwMMATXheLHuu4N8DxaSF8e68',
            'KXkFUQfcSoyeas5wv7tFSZgzjiRBvQTKZL1UVLQecAU',
          ],
        },
      },
    }),
  );
}

export function GetAllMintsInfoResponse() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all NFTs on a perticular candy machine' }),
    ApiOkResponse({
      description: 'Get all NFTs on a perticular candy machine',
      schema: {
        example: {
          success: true,
          message: 'All NFTs minted on this candy machine address: H2oYLkXdkX38eQ6VTqs26KAWAvEpYEiCtLt4knEUJxpu',
          result: {
            nfts: [
              {
                name: 'Cet #3848',
                symbol: 'CoC+',
                royalty: 5,
                image_uri: 'https://arweave.net/ygVU5uRnJp_N9Z2xhkBvpsfbJj-gDg8VOD38Vq1HH64?ext=png',
                cached_image_uri: 'https://arweave.net/ygVU5uRnJp_N9Z2xhkBvpsfbJj-gDg8VOD38Vq1HH64?ext=png',
                metadata_uri: 'https://arweave.net/wNIHsXfKdikNwl6xBEUJUFN9p3B-_v6nQUuPexkyJ08',
                mint: 'GmVdwW7qQXrJpf52v244uLZxmPB4DRhsUdxtHK4HHaGe',
                owner: '4i7ZrpYC2duUXrss8QCf2Xe8DttdF2nXm9o6MMd4J67s',
                creators: [
                  {
                    address: 'EcUAwbpczgPqqhG1zVuPnojkCSR4faiyNyAE98jp57P1',
                    share: 100,
                    verified: false,
                  },
                ],
                collection: {},
                attributes: {
                  Background: 'Orange',
                  Skin: 'Pink',
                  Clothing: 'Naked',
                  Mouth: 'Bubble trouble',
                  Eye: 'IDGAF',
                  Headgear: 'Cet cap',
                },
                attributes_array: [
                  {
                    trait_type: 'Background',
                    value: 'Orange',
                  },
                  {
                    trait_type: 'Skin',
                    value: 'Pink',
                  },
                  {
                    trait_type: 'Clothing',
                    value: 'Naked',
                  },
                  {
                    trait_type: 'Mouth',
                    value: 'Bubble trouble',
                  },
                  {
                    trait_type: 'Eye',
                    value: 'IDGAF',
                  },
                  {
                    trait_type: 'Headgear',
                    value: 'Cet cap',
                  },
                ],
                files: [
                  {
                    uri: '3847.png',
                    type: 'image/png',
                  },
                ],
                update_authority: '4i7ZrpYC2duUXrss8QCf2Xe8DttdF2nXm9o6MMd4J67s',
              },
              {
                name: 'Cet #3848',
                symbol: 'CoC+',
                royalty: 5,
                image_uri: 'https://arweave.net/ygVU5uRnJp_N9Z2xhkBvpsfbJj-gDg8VOD38Vq1HH64?ext=png',
                cached_image_uri: 'https://arweave.net/ygVU5uRnJp_N9Z2xhkBvpsfbJj-gDg8VOD38Vq1HH64?ext=png',
                metadata_uri: 'https://arweave.net/wNIHsXfKdikNwl6xBEUJUFN9p3B-_v6nQUuPexkyJ08',
                mint: '5GdJvUMRHVH3HJWysRrtTLikT1VyaVSb2juua1CED1NZ',
                owner: 'FP8nkppERnEPCH2psZb9J3Jv3PeXQDnZRqNCsKDR3iNp',
                creators: [
                  {
                    address: 'EcUAwbpczgPqqhG1zVuPnojkCSR4faiyNyAE98jp57P1',
                    share: 50,
                    verified: false,
                  },
                  {
                    address: 'FP8nkppERnEPCH2psZb9J3Jv3PeXQDnZRqNCsKDR3iNp',
                    share: 50,
                    verified: false,
                  },
                ],
                collection: {},
                attributes: {
                  Background: 'Orange',
                  Skin: 'Pink',
                  Clothing: 'Naked',
                  Mouth: 'Bubble trouble',
                  Eye: 'IDGAF',
                  Headgear: 'Cet cap',
                },
                attributes_array: [
                  {
                    trait_type: 'Background',
                    value: 'Orange',
                  },
                  {
                    trait_type: 'Skin',
                    value: 'Pink',
                  },
                  {
                    trait_type: 'Clothing',
                    value: 'Naked',
                  },
                  {
                    trait_type: 'Mouth',
                    value: 'Bubble trouble',
                  },
                  {
                    trait_type: 'Eye',
                    value: 'IDGAF',
                  },
                  {
                    trait_type: 'Headgear',
                    value: 'Cet cap',
                  },
                ],
                files: [
                  {
                    uri: '3847.png',
                    type: 'image/png',
                  },
                ],
                update_authority: 'FP8nkppERnEPCH2psZb9J3Jv3PeXQDnZRqNCsKDR3iNp',
              },
              {
                name: 'Cet #4892',
                symbol: 'CoC+',
                royalty: 5,
                image_uri: 'https://arweave.net/sebifUQ3lHJDpGsMUf9amqGJ4O5mM-ow9ehYdD8gavA?ext=png',
                cached_image_uri: 'https://arweave.net/sebifUQ3lHJDpGsMUf9amqGJ4O5mM-ow9ehYdD8gavA?ext=png',
                metadata_uri: 'https://arweave.net/4hw1VhoFIziLvugabTI0ioDEKqgU2q7hAjKc-3Qe4hs',
                mint: '537d3MhYLiYemihaWH1PQLvUhnBpMJRLjnTVrJEAWnAW',
                owner: 'FP8nkppERnEPCH2psZb9J3Jv3PeXQDnZRqNCsKDR3iNp',
                creators: [
                  {
                    address: 'EcUAwbpczgPqqhG1zVuPnojkCSR4faiyNyAE98jp57P1',
                    share: 50,
                    verified: false,
                  },
                  {
                    address: 'FP8nkppERnEPCH2psZb9J3Jv3PeXQDnZRqNCsKDR3iNp',
                    share: 50,
                    verified: false,
                  },
                ],
                collection: {},
                attributes: {
                  Background: 'Olive',
                  Skin: 'IDGAF tatt',
                  Clothing: 'Haul of fall',
                  Mouth: 'grrr',
                  Eye: 'IDGAF',
                  Headgear: 'Cet cap',
                },
                attributes_array: [
                  {
                    trait_type: 'Background',
                    value: 'Olive',
                  },
                  {
                    trait_type: 'Skin',
                    value: 'IDGAF tatt',
                  },
                  {
                    trait_type: 'Clothing',
                    value: 'Haul of fall',
                  },
                  {
                    trait_type: 'Mouth',
                    value: 'grrr',
                  },
                  {
                    trait_type: 'Eye',
                    value: 'IDGAF',
                  },
                  {
                    trait_type: 'Headgear',
                    value: 'Cet cap',
                  },
                ],
                files: [
                  {
                    uri: '4891.png',
                    type: 'image/png',
                  },
                ],
                update_authority: 'FP8nkppERnEPCH2psZb9J3Jv3PeXQDnZRqNCsKDR3iNp',
              },
            ],
            page: 1,
            size: 3,
            total_data: 11,
            total_page: 4,
          },
        },
      },
    }),
  );
}
