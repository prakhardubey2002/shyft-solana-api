import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Emailer } from './common/utils/emailer';
import { User } from './dal/user-repo/user.schema';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: Model, // <-- Use the Model Class from Mongoose
        },
        AppService,
        Emailer,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Welcome to explore Shyft APIs!');
    });
  });
});
