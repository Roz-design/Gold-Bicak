"use client";

import { useEffect, useState } from "react";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor, getSaleTypeLabel } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber: string | null;
  items: { productName: string; saleType: string; quantity: number; totalPrice: number }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => d.success && setOrders(d.data));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold">Sipariş Geçmişi</h2>
      <div className="mt-4 space-y-4">
        {orders.length === 0 && (
          <p className="text-slate-500">Henüz siparişiniz yok.</p>
        )}
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold">{order.orderNumber}</div>
                <div className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.productName} ({getSaleTypeLabel(item.saleType)}) x{item.quantity}</span>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 font-bold">
              <span>Toplam</span>
              <span className="text-gold">{formatPrice(order.totalAmount)}</span>
            </div>
            {order.trackingNumber && (
              <p className="mt-2 text-sm">Kargo Takip: {order.trackingNumber}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
