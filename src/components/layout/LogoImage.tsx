interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function LogoImage({ src, alt, className, priority }: LogoImageProps) {
  return (
    // Next.js Image SVG desteklemediği için doğrudan img kullanılıyor
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function resolveLogoSrc(logoUrl: string) {
  return logoUrl === "/logo.svg" ? "/logo-full.svg" : logoUrl;
}

export { resolveLogoSrc };
