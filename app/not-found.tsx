import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl">Page not found</h1>
      <p className="mt-3 leading-7 text-[var(--ink-muted)]">
        That page does not exist. A conference or journal that used to be here
        may have been renamed in the spreadsheet, which changes its address.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/search">Search listings</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
