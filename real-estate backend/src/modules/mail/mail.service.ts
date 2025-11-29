import { mailTransporter } from '../../config/mail.config';
import ApiError from '../../utils/ApiError';
import { User } from '../user/user.model';

export const sendMailService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'Invalid User.');

  const accessToken = user.generateAccessToken('5m');
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${accessToken}`;

  const html = `
      <p>Hello,</p>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="color: blue; font-weight: bold;">
        Reset Password
      </a>
      <br/><br/>
      <p>This link will expire in 5 minutes.</p>
    `;

  const mailOptons = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Reset Password',
    html,
  };

  try {
    await mailTransporter.sendMail(mailOptons);
  } catch (error) {
    throw new ApiError(400, (error as Error).message);
  }
};
