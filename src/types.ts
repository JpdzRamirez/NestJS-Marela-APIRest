import { Request } from 'express';
import { User } from './modules/users/user.entity';
interface LoginData {
  email: string;
  password: string;
  auth_code: string;
}

interface RegisterData {
  name: string;
  lastname: string;
  document: string;
  phone?: string;
  mobile: string;
  email: string;
  password: string;
  role_id?: number;
}

interface AuthRequest extends Request {
  user?: User;
  authToken?: string;
}

export {LoginData, RegisterData,AuthRequest };