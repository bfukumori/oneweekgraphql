import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";
import { CartItem } from "../graphql/types";

const protocol = `${
  process.env.NODE_ENV === "development" ? "http" : "https"
}://`;

const host =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"
    : window.location.host;

export const origin = `${protocol}${host}`;

const cache = new InMemoryCache({
  typePolicies: {
    Cart: {
      fields: {
        items: {
          merge(
            existing: CartItem[],
            incoming: CartItem[],
            { readField, mergeObjects }
          ) {
            const merged: CartItem[] = existing ? existing.slice(0) : [];
            const itemIdToIndex: Record<string, number> = Object.create(null);
            if (existing) {
              existing.forEach((item, index) => {
                itemIdToIndex[readField<string>("id", item)!] = index;
              });
            }
            incoming.forEach((item) => {
              const id = readField<string>("id", item);
              const index = itemIdToIndex[id!];
              if (typeof index === "number") {
                merged[index] = mergeObjects(merged[index], item);
              } else {
                itemIdToIndex[id!] = merged.length;
                merged.push(item);
              }
            });
            return merged;
          },
        },
      },
    },
  },
});

export const useClient = () => {
  const client = useMemo(
    () => new ApolloClient({ uri: `${origin}/api`, cache }),
    []
  );
  return client;
};
