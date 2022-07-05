import { GetServerSideProps, NextPage } from "next";
import { CartDetail } from "../components/CartDetail";
import { useGetCartQuery } from "../graphql/types";
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
  const { data } = useGetCartQuery({
    variables: {
      cartId,
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <CartDetail cart={data?.cart} />
        </div>
      </main>
    </div>
  );
};

export default Cart;
