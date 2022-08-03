import { Test, TestingModule } from '@nestjs/testing';
import { StorageMetadataService } from 'dist/modules/nft/components/storage-metadata/storage-metadata.service';
import { CreateTokenService } from 'dist/modules/token/components/create-token/create-token.service';
import { CreateTokenController } from './create-token.controller';

describe('CreateTokenController', () => {
  let controller: CreateTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTokenController],
      providers: [CreateTokenService, StorageMetadataService]
    }).compile();

    controller = module.get<CreateTokenController>(CreateTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
