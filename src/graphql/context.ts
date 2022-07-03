import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type GraphQLContext = {
  prisma: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}
