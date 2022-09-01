import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as mime from 'mime';

import { configuration } from '../configs/config';

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
  public async upload(image: string, data: any, contentType: string): Promise<string> {
    try {
      const encodedImage = encodeURIComponent(image);
      const ext = mime.getExtension(contentType);
      const filename = `img/${encodedImage}.${ext}`;
      await new Upload({
        client,
        params: {
          Bucket: s3Bucket,
          Key: filename,
          Body: data,
          ContentType: contentType,
        },
      }).done(); 
      const fileUrl = `https://${s3Bucket}/${filename}`;
      return fileUrl;
    } catch (error) {
      console.error(error);
      throw new Error('Data caching failed');
    }
  }

  public async delete(fileUrl: string) {
    try {
      const key = (new URL(fileUrl).pathname).substring(1);
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: s3Bucket,
        Key: key
      });
      const response = await client.send(deleteObjectCommand);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Delete operation failed')
    }
  }
}
