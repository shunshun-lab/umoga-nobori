import { NextResponse } from "next/server";
import { getStripe, getStripePriceId, type PlanId } from "@/lib/stripe";
import { getAppUrl } from "@/lib/app-url";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body?.plan as string | undefined;

    if (!plan || !["pro", "team"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Use 'pro' or 'team'." },
        { status: 400 }
      );
    }

    const priceId = getStripePriceId(plan as PlanId);

    const appUrl = getAppUrl();
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      locale: "ja",
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
