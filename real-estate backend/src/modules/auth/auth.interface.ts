import { Types } from 'mongoose';

export type accessTokenType = {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
};
