import Link from "next/link";
import { Database } from "lucide-react";
import SubmitPrompt from "./SubmitPrompt";

export default function Footer({textOverride}: {textOverride?: string}) {
	return (
		<footer className="w-full py-4 bg-transparent">
			<div className="w-full">
				<div className="flex justify-center">
					<SubmitPrompt text={textOverride} />
				</div>
				<div className="mt-2 flex justify-start">
					<Link
						href="/data"
						className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition"
					>
						<Database className="h-4 w-4" />
						<span>Data &amp; Attribution</span>
					</Link>
				</div>
			</div>
		</footer>
	);
}
