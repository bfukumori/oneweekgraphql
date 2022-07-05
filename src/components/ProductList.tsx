import { Product } from "../lib/products";
import { ProductLink } from "./ProductLink";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
      {products.map((product) => (
        <ProductLink key={product.id} product={product} />
      ))}
    </ul>
  );
}
