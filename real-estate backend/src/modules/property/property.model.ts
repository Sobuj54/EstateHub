import { Schema, model } from 'mongoose';
import { IPropertyDocument } from './property.interface';

const CoordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const defaultImages = [
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  'https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  'https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
];

const PropertySchema = new Schema<IPropertyDocument>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    address: { type: String, required: true, trim: true },
    bedrooms: { type: Number, required: true, min: 1 },
    bathrooms: { type: Number, required: true, min: 1 },
    sqft: { type: Number, required: true, min: 10 },

    propertyType: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'land', 'commercial'],
    },
    images: {
      type: [String],
      default: defaultImages,
    },

    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    coordinates: { type: CoordinatesSchema, required: true },
    isApproved: { type: Boolean, default: false },
    amenities: [{ type: String, trim: true }],
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    collation: { locale: 'en', strength: 2 },
  }
);

export const Property = model<IPropertyDocument>('Property', PropertySchema);
