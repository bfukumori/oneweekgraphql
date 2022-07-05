import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { ProductDetail } from "../../components/ProductDetail";
import { Product, products } from "../../lib/products";

export const getServerSideProps: GetServerSideProps<{
  product: Product | null;
}> = async ({ query }) => {
  const product =
    products.find((product) => product.slug === query.slug) || null;
  return {
    props: {
      product,
    },
  };
};

const ProductPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => {
  return product && <ProductDetail product={product} />;
};

export default ProductPage;
