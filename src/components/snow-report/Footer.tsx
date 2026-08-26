import Link from "next/link";
import { Database } from "lucide-react";
import SubmitPrompt from "./SubmitPrompt";
import SupportCard from "./SupportCard";
import Copyright from "./Copyright";

export default function Footer({
	textOverride,
	showSupport = true,
}: {
	textOverride?: string;
	showSupport?: boolean;
}) {
	return (
		<footer className="w-full py-4 bg-transparent">
			<div className="w-full">
				{showSupport ? (
					<div className="mb-6">
						<SupportCard />
					</div>
				) : null}
				<div className="flex justify-center">
					<SubmitPrompt text={textOverride} />
				</div>
				<div className="mt-4 sm:mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
						<Link
							href="/data"
							className="inline-flex items-center gap-1.5 hover:text-slate-200 transition"
						>
							<Database className="h-4 w-4" />
							<span>Data &amp; Attribution</span>
						</Link>
						<Link href="/terms" className="hover:text-slate-200 transition">
							Terms
						</Link>
						<Link href="/privacy" className="hover:text-slate-200 transition">
							Privacy
						</Link>
					</nav>
					<Copyright />
				</div>
			</div>
		</footer>
	);
}
