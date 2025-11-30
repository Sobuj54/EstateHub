import { CookieOptions } from 'express';

export const roles = ['agent', 'admin', 'super_admin', 'member'];

export const passwordRegex = /(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};
