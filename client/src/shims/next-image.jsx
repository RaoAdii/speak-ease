export default function NextImage({ fill, alt, style, className, ...props }) {
    const mergedStyle = fill
        ? {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            ...style
        }
        : style || {};
    return <img alt={alt} className={className} style={mergedStyle} {...props}/>;
}
