
import { prisma } from "../db";

export const CommentService = {

  create: (data: any) =>
    prisma.comment.create({
      data,
      include: { post: true, user: true }
    }),

  findAll: async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const data = await prisma.comment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { post: true, user: true }
    });

    const total = await prisma.comment.count();

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
    prisma.comment.findUnique({
      where: { id },
      include: { post: true, user: true }
    }),

  update: (id: number, data: any) =>
    prisma.comment.update({
      where: { id },
      data,
      include: { post: true, user: true }
    }),

  delete: (id: number) =>
    prisma.comment.delete({
      where: { id }
    })
};
