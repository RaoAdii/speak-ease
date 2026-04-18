import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

const NextLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, ...props }, ref) => {
    const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:");

    if (isExternal) {
      return (
        <a href={href} ref={ref} {...props}>
          {children}
        </a>
      );
    }

    return (
      <Link to={href} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);

NextLink.displayName = "NextLink";

export default NextLink;
