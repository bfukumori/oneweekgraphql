import Link from "next/link";
import { Product } from "../lib/products";
import { ProductItem } from "./ProductItem";

export function ProductLink({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <a className="bg-gray-400 min-h-[500px]">
        <ProductItem product={product} />
      </a>
    </Link>
  );
}
