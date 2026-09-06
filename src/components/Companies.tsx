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
  // Most uploaded logos come as flat, opaque-white exports (app-icon style),
  // not transparent PNGs — left alone, that reads as three mismatched white
  // squares dropped onto a dark card. Making the white a deliberate "chip"
  // with real padding turns that into one consistent, intentional treatment
  // instead. Logo-less cards keep the dark gradient — plain initials don't
  // need a white backing the way an image does.
  const logoBox = company.logoPath
    ? "bg-white ring-1 ring-black/5 shadow-sm group-hover:shadow-md"
    : "bg-gradient-to-br from-neutral-800 to-neutral-900 ring-1 ring-white/5 group-hover:ring-white/10";

  const inner = (
    <>
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-2xl p-4 transition-all duration-300 ${logoBox}`}
      >
        {company.logoPath ? (
          <img
            src={company.logoPath}
            alt={company.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="font-heading text-3xl tracking-wide text-neutral-500 transition-colors group-hover:text-neutral-200">
            {initials(company.name)}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        <p className="text-lg font-medium text-white">{company.name}</p>
        {company.url && (
          <span className="text-sm text-neutral-600 transition-colors group-hover:text-white">
            ↗
          </span>
        )}
      </div>
    </>
  );

  const className =
    "group flex w-60 flex-none flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/30";

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

        {/* flex + justify-center rather than a grid: a grid leaves a short
            row (e.g. 3 cards on a 4-column track) stranded on the left,
            while this centers the row regardless of how many there are. */}
        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {items.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
