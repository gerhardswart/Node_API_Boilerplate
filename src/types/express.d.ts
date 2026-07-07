import 'express';
import type { IRequestUser } from './index';

declare module 'express' {
  interface Request {
    user?: IRequestUser;
    requestId?: string;
  }
}
