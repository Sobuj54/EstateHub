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
  pageNo: number,
  query: string
): Promise<{
  properties: IProperty[];
  currentPage: number;
  totalPage: number;
}> => {
  const skip = (pageNo - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { address: { $regex: query, $options: 'i' } },
    ];
  }

  const properties = await Property.find(filter)
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
  if (!properties.length) throw new ApiError(200, 'NO properties found.');

  const totalProperties = await Property.countDocuments(filter);

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

const verifyAProperty = async (id: string): Promise<IProperty> => {
  const property = await Property.findByIdAndUpdate(
    id,
    {
      $set: {
        isApproved: true,
      },
    },
    { new: true }
  ).lean();

  if (!property) throw new ApiError(400, 'No property found.');
  return property;
};

export {
  addProperty,
  getProperties,
  getProperty,
  deleteProperty,
  verifyAProperty,
};
