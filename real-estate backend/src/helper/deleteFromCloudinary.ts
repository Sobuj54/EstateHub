import cloudinary from '../config/cloudinary.config';
import ApiError from '../utils/ApiError';

export const deleteFromCloudinary = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: 'image',
    });
  } catch (error) {
    throw new ApiError(500, 'Image deletion failed from cloudinary.');
  }
};
