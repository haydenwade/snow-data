export type LegalBlock = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function LegalSection({
  index,
  block,
}: {
  index: number;
  block: LegalBlock;
}) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <h2 className="text-base font-semibold text-white">
        <span className="mr-2 text-slate-500">{index}.</span>
        {block.heading}
      </h2>
      {block.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-3 text-sm leading-6 text-slate-300">
          {paragraph}
        </p>
      ))}
      {block.bullets ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300 marker:text-slate-500">
          {block.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
