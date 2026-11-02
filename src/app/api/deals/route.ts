import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const merchant = searchParams.get("merchant");
    const search = searchParams.get("search");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "300", 10), 1), 500);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const where: any = { isExpired: false };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (merchant && merchant !== "ALL") {
      where.merchant = merchant;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Parallel fetch: deals, total for current query, and global category counts across all active deals
    const [deals, total, groupCounts, totalActive] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        skip,
      }),
      prisma.deal.count({ where }),
      prisma.deal.groupBy({
        by: ["category"],
        where: { isExpired: false },
        _count: { id: true },
      }),
      prisma.deal.count({ where: { isExpired: false } }),
    ]);

    const categoryCounts: Record<string, number> = { ALL: totalActive };
    for (const g of groupCounts) {
      categoryCounts[g.category] = g._count.id;
    }

    return NextResponse.json({
      deals,
      total,
      categoryCounts,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
