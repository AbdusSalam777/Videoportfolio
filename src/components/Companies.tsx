import type { Company } from "@/lib/profile-types";

function Logo({ company }: { company: Company }) {
  if (company.logoPath) {
    return (
      <img
        src={company.logoPath}
        alt={company.name}
        loading="lazy"
        className="max-h-8 w-auto opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
      />
    );
  }
  // No logo uploaded — render the name as a wordmark so the row still reads well.
  return (
    <span className="font-heading text-lg tracking-wide text-neutral-500 transition-colors group-hover:text-white">
      {company.name}
    </span>
  );
}

export default function Companies({ items }: { items: Company[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-800 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-neutral-500">
          Trusted by
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {items.map((c) =>
            c.url ? (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center"
              >
                <Logo company={c} />
              </a>
            ) : (
              <div key={c.id} className="group flex items-center">
                <Logo company={c} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
