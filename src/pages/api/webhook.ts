import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function Webhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = await getRawBody(req);
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    if (!signature) {
      throw new Error("Missing stripe signature");
    }
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
  if (event?.type === "checkout.session.completed") {
    const _session = event.data.object as Stripe.Checkout.Session;
    console.log("Fulfilling order");
  }
  res.status(200).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
