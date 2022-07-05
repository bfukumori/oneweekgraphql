import { ApolloError } from "apollo-server-micro";
import currencyFormatter from "../helper/currencyFormatter";
import { origin } from "../hooks/useClient";
import { findOrCreateCart, validateCartItems } from "../lib/cart";
import { products } from "../lib/products";
import { stripe } from "../lib/stripe";
import { Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => {
      return findOrCreateCart(prisma, id);
    },
  },
  Cart: {
    items: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      return items;
    },
    totalItems: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      return items.reduce((total, item) => total + item.quantity || 1, 0);
    },
    subTotal: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      const amount =
        items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;

      const formatted = currencyFormatter("en-US", "USD", amount);

      return {
        formatted,
        amount,
      };
    },
  },
  CartItem: {
    unitTotal: (item) => {
      const amount = item.price;
      return {
        formatted: currencyFormatter("en-US", "USD", amount),
        amount,
      };
    },
    lineTotal: (item) => {
      const amount = item.quantity * item.price;
      return {
        formatted: currencyFormatter("en-US", "USD", amount),
        amount,
      };
    },
  },
  Mutation: {
    addItem: async (_, { input }, { prisma }) => {
      const cart = await findOrCreateCart(prisma, input.cartId);
      await prisma.cartItem.upsert({
        create: {
          id: input.id,
          name: input.name,
          description: input.description,
          price: input.price,
          quantity: input.quantity || 1,
          image: input.image,
          cartId: cart.id,
        },
        update: {
          quantity: {
            increment: input.quantity || 1,
          },
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: cart.id,
          },
        },
      });
      return cart;
    },
    removeItem: async (_, { input }, { prisma }) => {
      const { cartId } = await prisma.cartItem.delete({
        where: {
          id_cartId: {
            id: input.id,
            cartId: input.cartId,
          },
        },
        select: {
          cartId: true,
        },
      });
      return findOrCreateCart(prisma, cartId);
    },
    increaseCartItem: async (_, { input }, { prisma }) => {
      const { cartId } = await prisma.cartItem.update({
        data: {
          quantity: {
            increment: 1,
          },
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: input.cartId,
          },
        },
        select: {
          cartId: true,
        },
      });
      return findOrCreateCart(prisma, cartId);
    },
    decreaseCartItem: async (_, { input }, { prisma }) => {
      const { cartId, quantity } = await prisma.cartItem.update({
        data: {
          quantity: {
            decrement: 1,
          },
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: input.cartId,
          },
        },
        select: {
          cartId: true,
          quantity: true,
        },
      });
      if (quantity <= 0) {
        await prisma.cartItem.delete({
          where: {
            id_cartId: {
              id: input.id,
              cartId: input.cartId,
            },
          },
        });
      }
      return findOrCreateCart(prisma, cartId);
    },
    createCheckoutSession: async (_, { input }, { prisma }) => {
      const cart = await prisma.cart.findUnique({
        where: {
          id: input.cartId,
        },
      });
      if (!cart) {
        throw new ApolloError("Invalid cart");
      }
      const cartItems = await prisma.cart
        .findUnique({
          where: {
            id: input.cartId,
          },
        })
        .items();
      if (!cartItems || cartItems.length === 0) {
        throw new ApolloError("Cart is empty");
      }
      const line_items = validateCartItems(products, cartItems);

      const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/Thankyou?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart?cancelled=true`,
        line_items,
        metadata: {
          cartId: cart.id,
        },
        mode: "payment",
      });

      return {
        id: session.id,
        url: session.url,
      };
    },
  },
};
