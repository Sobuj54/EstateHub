import ApiError from '../../utils/ApiError';
import { SavedProperty } from './savedProperty.model';

const addProperty = async (propertyId: string, userId: string) => {
  const filter = {
    $and: [{ propertyId }, { userId }],
  };
  const existingSaved = await SavedProperty.findOne(filter);
  if (existingSaved) throw new ApiError(409, 'Already saved resource.');

  const newSaved = await SavedProperty.create({ propertyId, userId });
  if (!newSaved) throw new ApiError(500, 'Failed to save property.');
};

const savedProperties = async (id: string, limit: number, pageNo: number) => {
  const skip = (pageNo - 1) * limit;
  const savedProperties = await SavedProperty.find({ userId: id })
    .populate({
      path: 'propertyId',
      select:
        'title price address images description bedrooms bathrooms sqft createdAt',
      populate: {
        path: 'agent',
        select: 'name emailavatar',
      },
    })
    .limit(limit)
    .skip(skip);
  if (!savedProperties.length)
    throw new ApiError(404, 'No saved properties found.');

  const totalSavedProperties = await SavedProperty.countDocuments({
    userId: id,
  });

  const totalPages = Math.ceil(totalSavedProperties / limit);

  return { savedProperties, currentPage: pageNo, totalPages };
};

export { addProperty, savedProperties };
