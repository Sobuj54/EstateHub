import mongoose, { Schema } from 'mongoose';
import { ISavedProperty } from './savedProperty.interface';

const savedPropertySchema = new Schema<ISavedProperty>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true }
);

export const SavedProperty = mongoose.model<ISavedProperty>(
  'SavedProperty',
  savedPropertySchema
);
