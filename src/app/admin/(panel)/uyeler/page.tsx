"use client";

import { adminPath, adminApiPath } from "@/lib/admin-path";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);

  function loadUsers() {
    fetch(adminApiPath("/users"))
      .then((r) => r.json())
      .then((d) => d.success && setUsers(d.data));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateStatus(userId: string, status: string) {
    await fetch(adminApiPath("/users"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    loadUsers();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Üye Yönetimi</h1>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-3">Ad Soyad</th>
              <th className="p-3">E-posta</th>
              <th className="p-3">Telefon</th>
              <th className="p-3">Doğrulama</th>
              <th className="p-3">Sipariş</th>
              <th className="p-3">Durum</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id as string} className="border-b">
                <td className="p-3">{user.firstName as string} {user.lastName as string}</td>
                <td className="p-3">{user.email as string}</td>
                <td className="p-3">{user.phone as string}</td>
                <td className="p-3">
                  {user.phoneVerified ? (
                    <span className="text-green-600">Doğrulandı</span>
                  ) : (
                    <span className="text-red-600">Bekliyor</span>
                  )}
                </td>
                <td className="p-3">{(user._count as { orders: number })?.orders}</td>
                <td className="p-3">{user.status as string}</td>
                <td className="p-3">
                  <select
                    value={user.status as string}
                    onChange={(e) => updateStatus(user.id as string, e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Pasif</option>
                    <option value="BLOCKED">Engelli</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
