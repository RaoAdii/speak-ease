import type { CSSProperties, ImgHTMLAttributes } from "react";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
};

export default function NextImage({
  fill,
  alt,
  style,
  className,
  ...props
}: ImageProps) {
  const mergedStyle: CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        ...style
      }
    : style || {};

  return <img alt={alt} className={className} style={mergedStyle} {...props} />;
}
