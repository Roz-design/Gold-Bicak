import Image from "next/image";

interface FlexibleImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

function isRemoteUrl(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export default function FlexibleImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: FlexibleImageProps) {
  if (isRemoteUrl(src)) {
    return (
      // Harici URL'ler (Amazon vb.) next.config'e eklenmeden gösterilebilir
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={fill ? `absolute inset-0 h-full w-full ${className ?? ""}` : className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("/uploads/") || src.endsWith(".svg")}
    />
  );
}
