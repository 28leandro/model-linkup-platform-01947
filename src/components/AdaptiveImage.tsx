import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useNetwork } from "@/contexts/NetworkContext";

type Quality = { width: number; quality: number };

interface AdaptiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  src: string;
  alt: string;
  priority?: boolean;
  fallbackColor?: string;
  containerClassName?: string;
  sizes?: string;
}

function pickQuality(effectiveType: string, saveData: boolean, isSlow: boolean): Quality {
  if (saveData || effectiveType === "2g" || effectiveType === "slow-2g") {
    return { width: 350, quality: 50 };
  }
  if (effectiveType === "3g" || isSlow) {
    return { width: 500, quality: 65 };
  }
  return { width: 800, quality: 80 };
}

function transformSupabaseUrl(src: string, q: Quality): string {
  if (!src) return src;
  // Rewrite public object URL → render/image endpoint with resize params.
  const marker = "/storage/v1/object/public/";
  if (src.includes(marker)) {
    const transformed = src.replace(marker, "/storage/v1/render/image/public/");
    const sep = transformed.includes("?") ? "&" : "?";
    return `${transformed}${sep}width=${q.width}&quality=${q.quality}&format=webp&resize=cover`;
  }
  return src;
}

function buildSupabaseSrcSet(src: string, quality: number): string | undefined {
  if (!src) return undefined;
  const marker = "/storage/v1/object/public/";
  if (!src.includes(marker)) return undefined;
  const base = src.replace(marker, "/storage/v1/render/image/public/");
  const widths = [320, 480, 640, 800, 1200];
  return widths
    .map((w) => {
      const sep = base.includes("?") ? "&" : "?";
      return `${base}${sep}width=${w}&quality=${quality}&format=webp&resize=cover ${w}w`;
    })
    .join(", ");
}

const AdaptiveImage = ({
  src,
  alt,
  priority = false,
  fallbackColor = "hsl(var(--muted))",
  className,
  containerClassName,
  width,
  height,
  onError,
  ...rest
}: AdaptiveImageProps) => {
  const { effectiveType, saveData, isSlow, online } = useNetwork();
  const [errored, setErrored] = useState(false);

  const q = pickQuality(effectiveType, saveData, isSlow);
  const finalSrc = transformSupabaseUrl(src, q);
  const srcSet = buildSupabaseSrcSet(src, q.quality);

  if (errored && !online) {
    return (
      <div
        className={cn("w-full h-full", containerClassName, className)}
        style={{ backgroundColor: fallbackColor }}
        aria-label={alt}
        role="img"
      />
    );
  }

  return (
    <img
      src={finalSrc}
      srcSet={srcSet}
      sizes={rest.sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // @ts-ignore - valid HTML attr
      fetchpriority={priority ? "high" : "auto"}
      className={className}
      style={{ backgroundColor: fallbackColor }}
      onError={(e) => {
        setErrored(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
};

export default AdaptiveImage;