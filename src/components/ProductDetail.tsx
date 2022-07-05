import { getCookie } from "cookies-next";
import { FormEvent } from "react";
import { useAddToCartMutation } from "../graphql/types";
import { Product } from "../lib/products";
import { ProductItem } from "./ProductItem";

export function ProductDetail({ product }: { product: Product }) {
  const cartId = getCookie("cartId") as string;
  const [AddToCart, { loading }] = useAddToCartMutation({
    variables: {
      input: {
        cartId,
        id: product.id,
        name: product.title,
        description: product.body,
        price: product.price,
        image: product.src,
      },
    },
  });
  if (!product) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    AddToCart();
  }

  return (
    <main className="grid grid-cols-4 h-[700px]">
      <div className="col-span-3 flex items-center justify-center">
        <ProductItem product={product} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-8 space-y-4">
          <div dangerouslySetInnerHTML={{ __html: product.body }} />
          <button
            className="px-6 py-4 bg-black rounded w-full text-white hover:bg-white hover:text-black border border-black uppercase"
            type="submit"
          >
            {loading ? "Adding to cart..." : "Add to cart"}
          </button>
        </div>
      </form>
    </main>
  );
}
