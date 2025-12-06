import ApiError from '../../utils/ApiError';
import { IProperty } from './property.interface';
import { Property } from './property.model';

const addProperty = async (
  property: IProperty,
  id: string
): Promise<IProperty> => {
  const updatedProperty = { ...property, agent: id };
  const res = await Property.create(updatedProperty);
  if (!res) throw new ApiError(400, 'Property creation failed.');
  return res;
};

const getProperties = async (
  limit: number,
  pageNo: number
): Promise<{
  properties: IProperty[];
  currentPage: number;
  totalPage: number;
}> => {
  const skip = (pageNo - 1) * limit;

  const properties = await Property.find({})
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate({
      path: 'agent',
      select: {
        name: 1,
        email: 1,
        avatar: 1,
        _id: 0,
      },
    })
    .lean();
  if (!properties.length) throw new ApiError(404, 'NO properties found.');

  const totalProperties = await Property.countDocuments();

  const totalPage = Math.ceil(totalProperties / limit);

  return { properties, currentPage: pageNo, totalPage };
};

const getProperty = async (id: string): Promise<IProperty> => {
  const property = await Property.findById(id)
    .populate({
      path: 'agent',
      select: {
        name: 1,
        email: 1,
        avatar: 1,
        _id: 0,
      },
    })
    .lean();
  if (!property) throw new ApiError(404, 'No propery found.');
  return property;
};

const deleteProperty = async (id: string) => {
  const property = await Property.findByIdAndDelete(id);
  if (!property) throw new ApiError(404, 'property deletion failed.');
};

export { addProperty, getProperties, getProperty, deleteProperty };
