
import { prisma } from "../db";

export const PostService = {

  create: (data: any) =>
    prisma.post.create({
      data,
      include: { user: true, comment: true }
    }),

  findAll: async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const data = await prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true, comment: true }
    });

    const total = await prisma.post.count();

    return {
      data,
      meta: {
        page,
        limit,
        total
      }
    };
  },

  findOne: (id: number) =>
    prisma.post.findUnique({
      where: { id },
      include: { user: true, comment: true }
    }),

  update: (id: number, data: any) =>
    prisma.post.update({
      where: { id },
      data,
      include: { user: true, comment: true }
    }),

  delete: (id: number) =>
    prisma.post.delete({
      where: { id }
    })
};
