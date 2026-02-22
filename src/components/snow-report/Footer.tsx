export default function Footer({textOverride}: {textOverride?: string}) {
    const text = textOverride || "Have feedback?";
	return (
		<footer className="w-full py-4 bg-transparent flex justify-center">
			<span className="text-sm text-slate-400">
				{text}{' '}
				<a
					href="https://iwsm4g68769.typeform.com/to/NoB9jIfk"
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-blue-400"
				>
					Submit here
				</a>
			</span>
		</footer>
	);
}