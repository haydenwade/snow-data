import { MessageSquare } from "lucide-react";

const FEEDBACK_URL = "https://iwsm4g68769.typeform.com/to/NoB9jIfk";

export default function SubmitPrompt({ text }: { text?: string }) {
  const promptText = text || "Have feedback?";

  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/30 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-900/50"
    >
      <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span>{promptText}</span>
      <span className="font-semibold text-blue-400 transition group-hover:text-blue-300">
        Submit here
      </span>
      <span className="text-slate-500 transition group-hover:text-slate-300" aria-hidden="true">
        &rsaquo;
      </span>
    </a>
  );
}
