
import { prisma } from "../db";

export const DataSyncService = {

  create: (data: any) =>
    prisma.datasync.create({
      data,
      include: { integration: true }
    }),

  findAll: async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const data = await prisma.datasync.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { integration: true }
    });

    const total = await prisma.datasync.count();

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
    prisma.datasync.findUnique({
      where: { id },
      include: { integration: true }
    }),

  update: (id: number, data: any) =>
    prisma.datasync.update({
      where: { id },
      data,
      include: { integration: true }
    }),

  delete: (id: number) =>
    prisma.datasync.delete({
      where: { id }
    })
};
