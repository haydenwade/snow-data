"use client";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
	return (
		<header className="bg-slate-900 border-b border-slate-800">
			<div className="mx-auto max-w-6xl px-4">
				<div className="h-14 flex items-center">
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
				</div>
			</div>
		</header>
	);
}
