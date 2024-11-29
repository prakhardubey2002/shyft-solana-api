import { Test, TestingModule } from '@nestjs/testing';
import { StorageMetadataService } from 'dist/modules/nft/components/storage-metadata/storage-metadata.service';
import { UpdateNftService } from 'dist/modules/nft/components/update-nft/update-nft.service';
import { UpdateNftController } from './update-nft.controller';

describe('UpdateNftController', () => {
  let controller: UpdateNftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateNftController],
      providers: [UpdateNftService, StorageMetadataService]
    }).compile();

    controller = module.get<UpdateNftController>(UpdateNftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
