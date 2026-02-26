import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({
  icon: Icon,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className ?? ""}`.trim()}>
      <div className="w-full text-left">
        <div className="flex items-center gap-3 sm:gap-4">
          <Icon className="h-9 w-9 shrink-0 text-slate-200 sm:h-11 sm:w-11" />
          <h1 className="min-w-0 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-300 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
