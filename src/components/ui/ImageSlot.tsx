import { GalleryIcon } from "@/components/icons";

interface ImageSlotProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  shape?: "rect" | "rounded" | "circle";
  radius?: number;
  className?: string;
  /** "cover" (default) for photos filling the frame; "contain" for logos/marks that must stay whole. */
  fit?: "cover" | "contain";
}

const shapeClass: Record<NonNullable<ImageSlotProps["shape"]>, string> = {
  rect: "",
  rounded: "",
  circle: "rounded-full",
};

/**
 * Stand-in for the design handoff's <image-slot>. Real product photography is
 * intentionally absent from the handoff (README: "emplacements vides à
 * remplacer par les vraies photos produit") — this renders a soft placeholder
 * that keeps layout, ratio and radius identical to where a photo will land.
 */
export function ImageSlot({
  src,
  alt = "",
  placeholder,
  shape = "rect",
  radius,
  className = "",
  fit = "cover",
}: ImageSlotProps) {
  const style = shape === "rounded" && radius ? { borderRadius: radius } : undefined;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${shapeClass[shape]} ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[#efe6d5] text-[#bda87f] ${shapeClass[shape]} ${className}`}
      style={style}
    >
      <GalleryIcon size={18} strokeWidth={1.2} />
      {placeholder ? (
        <span className="px-2 text-center text-[9.5px] font-light leading-tight tracking-[0.4px] text-[#a5813f]/70">
          {placeholder}
        </span>
      ) : null}
    </div>
  );
}
