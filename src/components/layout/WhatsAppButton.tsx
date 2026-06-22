"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string;
}

export default function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const cleanPhone = phone.replace(/\D/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Merhaba, sipariş ve destek hattından yazıyorum.")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600 animate-pulse hover:animate-none"
      aria-label="WhatsApp Destek"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
