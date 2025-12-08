import { Document, Types } from 'mongoose';

export interface ISavedProperty {
  propertyId: Types.ObjectId;
  userId: Types.ObjectId;
}

export type savedPropertyDocument = ISavedProperty & Document;
