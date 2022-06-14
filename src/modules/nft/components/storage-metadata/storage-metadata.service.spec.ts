import { Test, TestingModule } from '@nestjs/testing';
import { StorageMetadataService } from './storage-metadata.service';

describe('StorageMetadataService', () => {
  let service: StorageMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageMetadataService],
    }).compile();

    service = module.get<StorageMetadataService>(StorageMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
