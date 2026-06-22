"use client";

import Link from "next/link";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-brand-black">Bir sorun oluştu</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Sayfa yüklenirken hata oluştu. Veritabanı bağlantısı veya geçici bir sorun olabilir.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-brand-black hover:bg-gold-dark"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
