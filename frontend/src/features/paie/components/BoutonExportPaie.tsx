export default function BoutonExportPaie() {
	return (
		<button
			type="button"
			onClick={() => window.print()}
			className="min-h-11 rounded-full border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 print:hidden"
		>
			Imprimer la fiche
		</button>
	);
}
