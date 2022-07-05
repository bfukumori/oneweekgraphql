import { removeCookies } from "cookies-next";
import { GetServerSideProps, NextPage } from "next";
import Router from "next/router";
import Stripe from "stripe";
import { CartDetail } from "../components/CartDetail";
import { useGetCartQuery } from "../graphql/types";
import { stripe } from "../lib/stripe";

interface ThankyouProps {
  session: Stripe.Checkout.Session;
}

export const getServerSideProps: GetServerSideProps<ThankyouProps> = async ({
  query,
}) => {
  const sessionId = query.session_id as string;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    props: {
      session,
    },
  };
};

const Thankyou: NextPage<ThankyouProps> = ({ session }) => {
  const { data } = useGetCartQuery({
    variables: {
      cartId: session.metadata?.cartId!,
    },
    skip: !session.metadata?.cartId,
  });
  return (
    <main className="flex-1 grid grid-cols-2 mx-auto max-w-4xl space-y-8 min-h-full">
      <div className="border-r border-neutral-700 p-8 space-y-4">
        <h1 className="text-4xl">Thanks!</h1>
        <p>Your order is confirmed!</p>
        <p>You&apos;ll receive an email when it&apos;s ready.</p>
        <p>
          Want to start a new order?{" "}
          <button
            type="button"
            className="font-bold text-pink-400 hover:text-pink-500"
            onClick={() => {
              removeCookies("cartId");
              Router.push("/");
            }}
          >
            Click here.
          </button>
        </p>
      </div>
      <div className="p-8">
        <CartDetail isReadOnly cart={data?.cart} />
      </div>
    </main>
  );
};

export default Thankyou;
