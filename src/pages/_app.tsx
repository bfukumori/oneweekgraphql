import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { useClient } from "../hooks/useClient";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  const client = useClient();
  return (
    <ApolloProvider client={client}>
      <Layout>
        <Component {...pageProps} />;
      </Layout>
    </ApolloProvider>
  );
}

export default MyApp;
