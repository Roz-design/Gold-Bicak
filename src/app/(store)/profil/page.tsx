"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => d.success && setProfile(d.data));
  }, []);

  if (!profile) return <div>Yükleniyor...</div>;

  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-lg font-bold">Kişisel Bilgiler</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          ["Ad", profile.firstName],
          ["Soyad", profile.lastName],
          ["T.C. Kimlik", profile.tcKimlik],
          ["Telefon", profile.phone],
          ["E-posta", profile.email],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
