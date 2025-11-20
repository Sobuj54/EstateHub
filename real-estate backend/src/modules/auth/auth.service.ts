import ApiError from '../../utils/ApiError';
import { IUser, UserDocument } from '../user/user.interface';
import { User } from '../user/user.model';

const login = async (
  data: Pick<IUser, 'email' | 'password'>
): Promise<UserDocument> => {
  const { email, password } = data;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'Invalid User.');

  const result = user.isPasswordCorrect(password);
  if (!result) throw new ApiError(401, 'Invalid user');

  return user;
};

const register = async (userData: IUser): Promise<IUser> => {
  const user = await User.create(userData);
  if (!user) throw new ApiError(400, 'User creation failed.');
  return user;
};

const logout = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'Logout failed.');
};

export { register, login, logout };
