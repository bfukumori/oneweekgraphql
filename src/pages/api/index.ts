import { join } from "path";
import { readFileSync } from "fs";
import { ApolloServer } from "apollo-server-micro";
import Cors from "micro-cors";

import { createContext } from "../../graphql/context";
import { resolvers } from "../../graphql/resolvers";

const typeDefs = readFileSync(
  join(process.cwd(), "src", "graphql", "schema.graphql"),
  {
    encoding: "utf-8",
  }
);

const cors = Cors();
export default cors(async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    csrfPrevention: true,
    cache: "bounded",
  });
  try {
    await apolloServer.start();
    await apolloServer.createHandler({
      path: "/api",
    })(req, res);
  } finally {
    apolloServer.stop();
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
