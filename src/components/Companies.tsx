import type { Company } from "@/lib/profile-types";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function CompanyCard({ company }: { company: Company }) {
  const inner = (
    <>
      <div className="flex h-24 items-center justify-center rounded-lg bg-neutral-950/60 px-4">
        {company.logoPath ? (
          <img
            src={company.logoPath}
            alt={company.name}
            loading="lazy"
            className="max-h-14 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-heading text-3xl tracking-wide text-neutral-600 transition-colors group-hover:text-neutral-300">
            {initials(company.name)}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="font-medium text-white">{company.name}</p>
        {company.url && (
          <span className="text-sm text-neutral-600 transition-colors group-hover:text-white">
            ↗
          </span>
        )}
      </div>
    </>
  );

  const className =
    "group block rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-neutral-600";

  return company.url ? (
    <a
      href={company.url}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export default function Companies({ items }: { items: Company[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Clients
        </p>
        <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
          Worked with
        </h2>
        <p className="mt-4 max-w-xl text-neutral-400">
          Brands and creators who&apos;ve trusted me with their footage.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
