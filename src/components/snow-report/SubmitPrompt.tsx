export default function SubmitPrompt({ text }: { text?: string }) {
  const promptText = text || "Have feedback?";

  return (
    <span className="text-sm text-slate-400">
      {promptText}{" "}
      <a
        href="https://iwsm4g68769.typeform.com/to/NoB9jIfk"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-blue-400"
      >
        Submit here
      </a>
    </span>
  );
}
