import { Coffee } from "lucide-react";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/haydenwade";

export default function SupportCard() {
  return (
    <section
      aria-labelledby="support-heading"
      className="rounded-xl border border-slate-800 bg-slate-800/40 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Support
          </div>
          <h2
            id="support-heading"
            className="mt-2 text-xl font-bold text-white"
          >
            Found this useful?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300/80">
            SNOWD is free and independent &mdash; no ads, no account required.
            If it helped you plan a day out, you can buy me a coffee. Support
            goes toward server costs and new features.
          </p>
        </div>
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-slate-900 transition hover:bg-amber-300 sm:self-auto"
        >
          <Coffee className="h-4 w-4" aria-hidden="true" />
          <span>Buy me a coffee</span>
        </a>
      </div>
    </section>
  );
}
