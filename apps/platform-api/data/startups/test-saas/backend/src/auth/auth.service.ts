
import { prisma } from "../db";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";

export const AuthService = {

  register: async (email: string, password: string) => {
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed }
    });

    return user;
  },

  login: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } }
      }
    });

    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const roles = user.roles.map(r => r.role.name);

    const token = signToken({
      id: user.id,
      email: user.email,
      roles
    });

    return { token };
  }
};
