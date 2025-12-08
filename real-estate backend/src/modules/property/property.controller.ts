import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserDocument } from '../user/user.interface';
import {
  addProperty,
  deleteProperty,
  getProperties,
  getProperty,
  verifyAProperty,
} from './property.service';

const createProperty = asyncHandler(async (req, res) => {
  const { ...property } = req.body;
  const result = await addProperty(
    property,
    (req.user as UserDocument)._id as string
  );
  res
    .status(201)
    .json(new ApiResponse(201, result, 'New Property added successfully.'));
});

const getAllProperties = asyncHandler(async (req, res) => {
  const { limit = 10, pageNo = 1, query } = req.query;
  const properties = await getProperties(
    Number(limit),
    Number(pageNo),
    query as string
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, properties, 'Fetched all properties successfully.')
    );
});

const getAProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await getProperty(id);
  res
    .status(200)
    .json(new ApiResponse(200, property, 'Fetched property successfully.'));
});

const deleteAProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteProperty(id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Deleted property successfully.'));
});

const verifyProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await verifyAProperty(id);
  res.status(200).json(new ApiResponse(200, result, 'Property Approved.'));
});

export {
  createProperty,
  getAllProperties,
  getAProperty,
  deleteAProperty,
  verifyProperty,
};
