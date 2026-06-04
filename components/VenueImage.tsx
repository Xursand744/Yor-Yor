import Image from "next/image";

type VenueImageProps = {
  src: string;
  alt: string;
  /** Wrapper height/width utilities, e.g. `h-40` or `h-[120px]` */
  containerClassName?: string;
  className?: string;
  sizes?: string;
};

/**
 * Tashqi URL (admin kiritgan) — unoptimized; remotePatterns talab qilmaydi.
 */
export function VenueImage({
  src,
  alt,
  containerClassName = "h-40",
  className = "object-cover",
  sizes = "(max-width: 768px) 100vw, 400px",
}: VenueImageProps) {
  return (
    <div className={`relative w-full overflow-hidden ${containerClassName}`}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className={className}
        sizes={sizes}
      />
    </div>
  );
}
