import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { startOfDay, subDays, startOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const type = new URL(request.url).searchParams.get("type") || "daily";

    const now = new Date();
    let startDate: Date;

    switch (type) {
      case "weekly":
        startDate = subDays(now, 7);
        break;
      case "monthly":
        startDate = startOfMonth(now);
        break;
      default:
        startDate = startOfDay(now);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "IPTAL_EDILDI" },
      },
      include: { items: true },
    });

    const totalSales = orders.reduce((s, o) => s + o.totalAmount, 0);
    const orderCount = orders.length;

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.totalPrice;
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const customerOrders: Record<string, { name: string; count: number; total: number }> = {};
    for (const order of orders) {
      if (!customerOrders[order.userId]) {
        customerOrders[order.userId] = {
          name: order.customerName,
          count: 0,
          total: 0,
        };
      }
      customerOrders[order.userId].count++;
      customerOrders[order.userId].total += order.totalAmount;
    }

    const topCustomers = Object.values(customerOrders)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const lowStock = await prisma.product.findMany({
      where: { stock: { lte: 20 }, hidden: false },
      orderBy: { stock: "asc" },
      take: 20,
      select: { id: true, name: true, code: true, stock: true },
    });

    return apiSuccess({
      type,
      totalSales,
      orderCount,
      topProducts,
      topCustomers,
      lowStock,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return apiError("Yetkisiz erişim", 403);
    return apiError("Bir hata oluştu", 500);
  }
}
