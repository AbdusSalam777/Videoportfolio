import type { Testimonial } from "@/lib/profile-types";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-800 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Testimonials
        </p>
        <h2 className="mt-3 font-heading text-2xl text-white md:text-4xl">
          What clients say
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 transition-colors hover:border-neutral-700"
            >
              <svg
                viewBox="0 0 32 32"
                aria-hidden="true"
                className="h-7 w-7 fill-neutral-700"
              >
                <path d="M9.4 8C5.9 8 3 10.9 3 14.4c0 3.4 2.6 6.2 6 6.4-.3 2-1.7 3.4-3.6 4-.5.2-.8.7-.6 1.2.2.4.6.7 1 .6 4.6-.9 7.9-4.9 7.9-10.2V14C13.7 10.5 12.5 8 9.4 8Zm14.9 0c-3.5 0-6.4 2.9-6.4 6.4 0 3.4 2.6 6.2 6 6.4-.3 2-1.7 3.4-3.6 4-.5.2-.8.7-.6 1.2.2.4.6.7 1 .6 4.6-.9 7.9-4.9 7.9-10.2V14c0-3.5-1.2-6-4.3-6Z" />
              </svg>

              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-neutral-200">
                {t.quote}
              </blockquote>

              <figcaption className="mt-6 border-t border-neutral-800 pt-4">
                <p className="text-sm font-medium text-white">{t.author}</p>
                {t.role && (
                  <p className="mt-0.5 text-sm text-neutral-500">{t.role}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
