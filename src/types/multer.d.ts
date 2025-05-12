import { Request } from 'express';

declare module 'multer' {
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface StorageEngine {
    _handleFile(req: Request, file: File, cb: (error?: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, cb: (error?: Error | null) => void): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
  }

  interface FileFilterCallback {
    (error: Error | null): void;
    (error: null, acceptFile: boolean): void;
  }

  interface Options {
    storage?: StorageEngine;
    fileFilter?: (req: Request, file: File, callback: FileFilterCallback) => void;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
  }

  interface Multer {
    (options?: Options): any;
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: { name: string; maxCount?: number }[]): any;
    none(): any;
    diskStorage(options: DiskStorageOptions): StorageEngine;
  }
} 