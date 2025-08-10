import { verifyAccessToken } from '../utils/jwt';

export const authMiddleware = ({ req }: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const user = verifyAccessToken(token); // Decoded payload
      return { user }; // Available in context.user
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
  return {};
};
