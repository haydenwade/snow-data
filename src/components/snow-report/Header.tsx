"use client";;
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
	const pathname = usePathname();
	const segments = (pathname || "").split("/").filter(Boolean);
	const isHome = segments.length === 0;
	return (
		<header className="bg-slate-900 border-b border-slate-800">
			<div className="mx-auto max-w-6xl px-4">
				<div className="h-14 flex items-center justify-between gap-4">
					<Link href="/" aria-label="SNOWD home" className="flex items-center gap-2">
						<Image
							src="/snowd-logo.png"
							alt="SNOWD"
							width={160}
							height={40}
							priority
							className="h-8 w-auto object-contain"
						/>
					</Link>

					{!isHome && (
						<nav className="flex items-center gap-1 sm:gap-2 text-sm text-slate-300">
							<Link
								href="/"
								className="px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
							>
								Locations
							</Link>
						</nav>
					)}
				</div>
			</div>
		</header>
	);
}