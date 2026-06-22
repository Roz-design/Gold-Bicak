import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { handleAdminError } from "@/lib/admin-api";

export async function GET() {
  try {
    await requireAdmin();
    const campaigns = await prisma.campaign.findMany({
      orderBy: { title: "asc" },
    });
    return apiSuccess(campaigns);
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body?.title) return apiError("Kampanya başlığı zorunludur", 400);

    const campaign = await prisma.campaign.create({
      data: {
        title: body.title,
        description: body.description || null,
        discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : null,
        active: body.active !== false,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    await logAdminAction(admin.id, "CAMPAIGN_CREATE", campaign.title, getClientIp(request));
    return apiSuccess(campaign, 201);
  } catch (error) {
    return handleAdminError(error);
  }
}
