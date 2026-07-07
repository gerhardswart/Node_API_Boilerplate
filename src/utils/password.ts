import bcrypt from 'bcrypt';
import config from '../config/index';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt.rounds);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
