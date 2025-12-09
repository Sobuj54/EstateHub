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
  limit = Math.max(1, limit);
  pageNo = Math.max(1, pageNo);

  const totalSavedProperties = await SavedProperty.countDocuments({
    userId: id,
  });

  let totalPages = 0;

  if (totalSavedProperties === 0) {
    return { savedProperties: [], currentPage: 1, totalPages: 0 };
  }

  totalPages = Math.ceil(totalSavedProperties / limit);

  if (pageNo > totalPages) {
    pageNo = totalPages;
  }
  const skip = (pageNo - 1) * limit;

  const savedProperties = await SavedProperty.find({ userId: id })
    .populate({
      path: 'propertyId',
      select:
        'title price address images description bedrooms bathrooms sqft createdAt',
      populate: {
        path: 'agent',
        select: 'name email avatar',
      },
    })
    .limit(limit)
    .skip(skip);

  return { savedProperties, currentPage: pageNo, totalPages };
};

const deleteSavedProperty = async (id: string) => {
  const savedProperty = await SavedProperty.findByIdAndDelete(id);
  if (!savedProperty) throw new ApiError(404, 'No such property exists.');
};

export { addProperty, savedProperties, deleteSavedProperty };
