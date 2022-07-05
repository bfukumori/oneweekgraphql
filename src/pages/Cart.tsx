import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { CartDetail } from "../components/CartDetail";
import { CartError } from "../components/CartError";
import {
  useCreateCheckoutSessionMutation,
  useGetCartQuery,
} from "../graphql/types";
import { getCartId } from "../lib/cart.client";

interface CartProps {
  cartId: string;
}

export const getServerSideProps: GetServerSideProps<CartProps> = async ({
  req,
  res,
}) => {
  const cartId = getCartId({ req, res });
  return {
    props: {
      cartId,
    },
  };
};

const Cart: NextPage<CartProps> = ({ cartId }) => {
  const router = useRouter();
  const { data } = useGetCartQuery({
    variables: {
      cartId,
    },
  });
  const [CreateCheckoutSession, { loading, error }] =
    useCreateCheckoutSessionMutation({
      variables: {
        input: {
          cartId,
        },
      },
      onCompleted(data) {
        if (data.createCheckoutSession?.url) {
          router.push(data.createCheckoutSession.url);
        }
      },
    });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <CartError error={error} />
          <CartDetail cart={data?.cart} />
          <div>
            <button
              title="checkout button"
              type="button"
              onClick={() => CreateCheckoutSession()}
              disabled={loading}
              className="p-1 font-light border border-neutral-700 hover:bg-black hover:text-white w-full"
            >
              {loading ? "Redirecting to Checkout" : "Go to Checkout"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
