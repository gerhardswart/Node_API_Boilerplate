import type { IRequestUser } from './index';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IRequestUser;
    requestId?: string;
  }
}
