import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  const settings = await getSiteSettings();
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const campaigns = await prisma.campaign.findMany({
    where: { active: true },
  });

  return apiSuccess({ settings, banners, campaigns });
}
