
import { prisma } from "../db";

export const CustomerService = {

  create: (data: any) =>
    prisma.customer.create({
      data,
      include: { integration: true }
    }),

  findAll: async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const data = await prisma.customer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { integration: true }
    });

    const total = await prisma.customer.count();

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
    prisma.customer.findUnique({
      where: { id },
      include: { integration: true }
    }),

  update: (id: number, data: any) =>
    prisma.customer.update({
      where: { id },
      data,
      include: { integration: true }
    }),

  delete: (id: number) =>
    prisma.customer.delete({
      where: { id }
    })
};
