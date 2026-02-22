import { getLinkMeta, Link } from "./ResortInfoLinksMeta";
import Badge from "./ResourceLinkBadge";

export default function ResourceCard({ link }: { link: Link }) {
  const meta = getLinkMeta(link);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/30 px-4 py-3 hover:bg-slate-900/50 transition w-full"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 shrink-0">{meta.icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-semibold text-white">{link.label}</div>
            {meta.badge && <Badge text={meta.badge} />}
          </div>
          <div className="text-sm text-slate-300/80">{meta.description}</div>
        </div>
      </div>
      <div className="text-slate-400 shrink-0">›</div>
    </a>
  );
}
