import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { Resolvers } from "../../types";
import { prisma } from "../../lib/prisma";
import type { PrismaClient } from "@prisma/client";

export type GraphQLContext = {
  prisma: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => {
      let cart = await prisma.cart.findUnique({
        where: {
          id,
        },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            id,
          },
        });
      }
      return cart;
    },
  },
  Cart: {
    items: async ({ id }, _, { prisma }) => {
      return await prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
    },
    totalItems: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
      return items.reduce((total, item) => total + item.quantity || 1, 0);
    },
    subTotal: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();

      const amount =
        items.reduce(
          (total, item) => total + item.price * item.quantity || 0,
          0
        ) ?? 0;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount / 100);

      return {
        formatted,
        amount,
      };
    },
  },
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createServer<{ req: NextApiRequest; res: NextApiResponse }>({
  endpoint: "/api",
  schema: {
    typeDefs,
    resolvers,
  },
  context: createContext(),
});
