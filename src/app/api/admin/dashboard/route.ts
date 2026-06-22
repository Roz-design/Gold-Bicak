import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess } from "@/lib/api";
import { handleAdminError } from "@/lib/admin-api";
import { startOfDay, startOfMonth } from "date-fns";

export async function GET() {
  try {
    await requireAdmin();

    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      shippedOrders,
      totalUsers,
      dailyOrders,
      monthlyOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { hidden: false } }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: ["ODEME_BEKLENIYOR", "ODEME_BILDIRILDI"] },
        },
      }),
      prisma.order.count({ where: { status: "KARGOYA_VERILDI" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: { not: "IPTAL_EDILDI" } },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: monthStart }, status: { not: "IPTAL_EDILDI" } },
        select: { totalAmount: true },
      }),
    ]);

    const dailySales = dailyOrders.reduce((s, o) => s + o.totalAmount, 0);
    const monthlySales = monthlyOrders.reduce((s, o) => s + o.totalAmount, 0);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return apiSuccess({
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        shippedOrders,
        totalUsers,
        dailySales,
        monthlySales,
      },
      recentOrders,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
