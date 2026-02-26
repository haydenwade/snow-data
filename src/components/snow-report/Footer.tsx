import SubmitPrompt from "./SubmitPrompt";

export default function Footer({textOverride}: {textOverride?: string}) {
	return (
		<footer className="w-full py-4 bg-transparent flex justify-center">
			<SubmitPrompt text={textOverride} />
		</footer>
	);
}
