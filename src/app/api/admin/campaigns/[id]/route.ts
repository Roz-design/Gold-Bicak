import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { apiError, apiSuccess, getClientIp } from "@/lib/api";
import { handleAdminError } from "@/lib/admin-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return apiError("Geçersiz istek", 400);

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.discountPercent !== undefined && {
          discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : null,
        }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.startDate !== undefined && {
          startDate: body.startDate ? new Date(body.startDate) : null,
        }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null,
        }),
      },
    });

    await logAdminAction(admin.id, "CAMPAIGN_UPDATE", campaign.title, getClientIp(request));
    return apiSuccess(campaign);
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const campaign = await prisma.campaign.delete({ where: { id } });
    await logAdminAction(admin.id, "CAMPAIGN_DELETE", campaign.title, getClientIp(request));
    return apiSuccess({ message: "Kampanya silindi" });
  } catch (error) {
    return handleAdminError(error);
  }
}
