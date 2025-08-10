import bcrypt from "bcryptjs";
import User from "../../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

export const authResolvers = {
  Mutation: {
    register: async (_: any, { input }: any) => {
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) throw new Error("Email already in use");

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = new User({ ...input, password: hashedPassword });
      await user.save();

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return { accessToken, refreshToken, user };
    },

    login: async (_: any, { input }: any) => {
      const user = await User.findOne({ email: input.email });
      if (!user) throw new Error("Invalid credentials");

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) throw new Error("Invalid credentials");

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return { accessToken, refreshToken, user };
    },

    refreshToken: async (_: any, { token }: any) => {
      try {
        const payload: any = verifyRefreshToken(token);
        const user = await User.findById(payload.id);
        if (!user) throw new Error("User not found");

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        };
      } catch {
        throw new Error("Invalid refresh token");
      }
    },
  },
};
