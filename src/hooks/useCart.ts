import { getCookie } from "cookies-next";
import { useGetCartQuery } from "../graphql/types";

export function useCart() {
  const cartId = getCookie("cartId") as string;
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return data?.cart;
}
