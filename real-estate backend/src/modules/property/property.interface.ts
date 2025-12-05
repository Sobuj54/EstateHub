import { Document, Types } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IProperty {
  title: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType:
    | 'apartment'
    | 'house'
    | 'condo'
    | 'townhouse'
    | 'land'
    | 'commercial';
  images: string[];
  agent: Types.ObjectId;
  coordinates: ICoordinates;
  isApproved: boolean;
  amenities: string[];
  description: string;
}

export interface IPropertyDocument extends IProperty, Document {}
