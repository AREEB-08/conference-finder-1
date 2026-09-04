import Link from "next/link";

import { Mark } from "@/components/landing/Wordmark";
import { footerNav, siteConfig } from "@/config/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="flex items-center gap-2.5 font-serif text-base font-semibold">
              <Mark size={22} />
              {siteConfig.name}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--ink-muted)]">
              A searchable index of academic conferences and journals, kept up to
              date in a spreadsheet by the people listed on the About page.
            </p>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <h2 className="font-sans text-sm font-medium">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--rule)] pt-6 text-sm text-[var(--ink-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p>
            Listings are compiled by hand. Always confirm dates and fees on the
            official website before submitting.
          </p>
        </div>
      </div>
    </footer>
  );
}
