import ApiResponse from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendMailService } from './mail.service';

export const resetPasswordMail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await sendMailService(email);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Reset link sent to your email'));
});
