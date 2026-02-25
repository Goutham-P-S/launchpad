
import { prisma } from "../db";

export const IntegrationService = {

  create: (data: any) =>
    prisma.integration.create({
      data,
      include: { customer: true, dataSync: true }
    }),

  findAll: async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const data = await prisma.integration.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { customer: true, dataSync: true }
    });

    const total = await prisma.integration.count();

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
    prisma.integration.findUnique({
      where: { id },
      include: { customer: true, dataSync: true }
    }),

  update: (id: number, data: any) =>
    prisma.integration.update({
      where: { id },
      data,
      include: { customer: true, dataSync: true }
    }),

  delete: (id: number) =>
    prisma.integration.delete({
      where: { id }
    })
};
