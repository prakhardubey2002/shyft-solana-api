import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand, S3, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as mime from 'mime';

import { configuration } from '../configs/config';
import { Utility } from './utils';

const { awsAccessKeyId, awsSecretAccessKey, awsRegion, sesApiVersion, s3Bucket } = configuration();

const client = new S3Client({
  region: awsRegion,
  apiVersion: sesApiVersion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

@Injectable()
export class S3UploaderService {
  public async upload(
    fileName: string,
    data: any,
    contentType: string,
  ): Promise<string> {
    try {
      const key = Utility.s3.getS3ImgKey(fileName);
      await new Upload({
        client,
        params: {
          Bucket: s3Bucket,
          Key: key,
          Body: data,
          ContentType: contentType,
        },
      }).done();
      const fileUrl = Utility.s3.getImgCdnUrl(key);
      return fileUrl;
    } catch (error) {
      console.error(error);
      throw new Error('Data caching failed');
    }
  }

  public async keyExists(key: string): Promise<boolean> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: s3Bucket,
        Key: key,
      });

      await client.send(headCommand);
      //If no error, return true
      return true;
    } catch (err) {
      return false;
    }
  }

  public async delete(fileUrl: string) {
    try {
      const key = Utility.s3.getS3ImgKey(fileUrl);
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: s3Bucket,
        Key: key,
      });
      const response = await client.send(deleteObjectCommand);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Delete operation failed')
    }
  }
}
