import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserDocument } from '../user/user.interface';
import { addProperty, savedProperties } from './savedProperty.service';

const addSavedProperty = asyncHandler(async (req, res) => {
  const { propertyId, userId } = req.body;
  await addProperty(propertyId as string, userId as string);
  res.status(201).json(new ApiResponse(201, null, 'Property saved.'));
});

const getSavedProperties = asyncHandler(async (req, res) => {
  const { limit = 5, pageNo = 1 } = req.query;
  const result = await savedProperties(
    (req.user as UserDocument)._id as string,
    Number(limit),
    Number(pageNo)
  );
  res
    .status(201)
    .json(new ApiResponse(201, result, 'Fetched all properties successfully.'));
});

export { addSavedProperty, getSavedProperties };
