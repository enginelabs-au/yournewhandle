import { SITE_HELLO_EMAIL, SITE_HELLO_MAILTO, SITE_SUPPORT_EMAIL, SITE_SUPPORT_MAILTO } from "@/lib/site/contact";

type SiteContactLinksProps = {
  /** Show hello only (e.g. compact footer brand row). */
  helloOnly?: boolean;
  className?: string;
  linkClassName?: string;
};

export function SiteContactLinks({
  helloOnly = false,
  className = "dr-footer-link-list",
  linkClassName = "dr-footer-link",
}: SiteContactLinksProps) {
  return (
    <ul className={className}>
      <li>
        <a href={SITE_HELLO_MAILTO} className={linkClassName}>
          {SITE_HELLO_EMAIL}
        </a>
      </li>
      {!helloOnly ? (
        <li>
          <a href={SITE_SUPPORT_MAILTO} className={linkClassName}>
            {SITE_SUPPORT_EMAIL}
          </a>
        </li>
      ) : null}
    </ul>
  );
}
