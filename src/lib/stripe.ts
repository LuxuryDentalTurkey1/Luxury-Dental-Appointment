import Stripe from "stripe";

// Create the Stripe client LAZILY (on first use at request time), never at
// import/build time — otherwise `next build` fails to collect page data for
// pages that import it when STRIPE_SECRET_KEY is not present in the build env.
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }
  return _stripe;
}

// A proxy so existing `stripe.checkout...`, `stripe.refunds...` call sites keep
// working unchanged, but the real client is only instantiated when accessed.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});
