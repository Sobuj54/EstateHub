/* eslint-disable no-unused-vars */
import { Document, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'agent' | 'admin' | 'super_admin' | 'member';
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  refreshToken?: string;
}

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(expiresIn: string): string;
  generateRefreshToken(duration: string): string;
}

export type UserDocument = IUser & IUserMethods & Document;

// for statics
export interface UserModel extends Model<UserDocument> {}

export type UploadedFile = {
  fieldname: string; // form field name
  originalname: string; // original file name
  encoding: string; // file encoding
  mimetype: string; // MIME type (e.g., image/jpeg)
  destination: string; // folder where file is stored
  filename: string; // filename on disk
  path: string; // full path on server
  size: number; // file size in bytes
};
