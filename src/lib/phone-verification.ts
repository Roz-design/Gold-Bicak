/** Gerçek SMS sağlayıcısı yoksa kapalı tutun (varsayılan: kapalı). */
export function isPhoneVerificationRequired() {
  return process.env.PHONE_VERIFICATION_REQUIRED === "true";
}
