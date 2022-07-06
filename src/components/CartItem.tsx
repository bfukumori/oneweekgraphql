import Image from "next/image";
import {
  CartItem,
  GetCartDocument,
  useDecreaseCartItemMutation,
  useIncreaseCartItemMutation,
  useRemoveFromCartMutation,
} from "../graphql/types";
import { CloseIcon } from "./CloseIcon";
import { MinusIcon } from "./MinusIcon";
import { PlusIcon } from "./PlusIcon";

export function CartItem({
  item,
  cartId,
  isReadOnly,
}: {
  item: CartItem;
  cartId: string;
  isReadOnly?: boolean;
}) {
  const [DecreaseCartItem, { loading: decreasingCartItem }] =
    useDecreaseCartItemMutation({
      variables: {
        input: {
          id: item.id,
          cartId,
        },
      },
      refetchQueries: [GetCartDocument],
    });
  const [IncreaseCartItem, { loading: increasingCartItem }] =
    useIncreaseCartItemMutation({
      variables: {
        input: {
          id: item.id,
          cartId,
        },
      },
      refetchQueries: [GetCartDocument],
    });

  const [RemoveFromCart, { loading: removingFromCart }] =
    useRemoveFromCartMutation({
      variables: {
        input: {
          id: item.id,
          cartId,
        },
      },
      refetchQueries: [GetCartDocument],
    });

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Image
          src={item.image || ""}
          width={75}
          height={75}
          alt={item.name}
          objectFit="cover"
        />
        <div className="flex justify-between items-baseline flex-1 gap-2">
          <div>
            <span className="text-lg">{item.name}</span>
            <span className="text-sm font-light block">
              Quantitity: {item.quantity}
            </span>
          </div>
          <span className="text-sm font-light">{item.unitTotal.formatted}</span>
        </div>
      </div>
      {isReadOnly ? null : (
        <div className="flex gap-2">
          <button
            type="button"
            title="remove button"
            onClick={() => RemoveFromCart()}
            disabled={removingFromCart}
            className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
          >
            <CloseIcon />
          </button>
          <div className="flex-1 flex">
            <div className="px-2 py-1 font-light border border-neutral-700 flex-1">
              {item.quantity}
            </div>
            <button
              onClick={() => DecreaseCartItem()}
              title="minus button"
              type="button"
              className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
              disabled={decreasingCartItem}
            >
              <MinusIcon />
            </button>
            <button
              onClick={() => IncreaseCartItem()}
              title="plus button"
              type="button"
              className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
              disabled={increasingCartItem}
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
