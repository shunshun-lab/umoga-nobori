import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllAccounts, getAllCommunities, getAllEvents, getAllPointTransactions } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [users, communities, events, transactions] = await Promise.all([
      getAllAccounts(),
      getAllCommunities(),
      getAllEvents(),
      getAllPointTransactions()
    ]);

    // Calculate total points circulated (or current total balance if users have points field, but mocking total distribution is interesting)
    // Let's sum up all positive point transactions as "Total Points Issued"
    const totalPointsIssued = transactions
      .filter((t: any) => parseInt(t.amount) > 0)
      .reduce((sum: number, t: any) => sum + parseInt(t.amount), 0);

    return NextResponse.json({
      userCount: users.length,
      communityCount: communities.length,
      eventCount: events.length,
      totalPointsIssued
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
