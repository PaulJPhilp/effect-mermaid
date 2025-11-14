import { RegistryProvider } from "@effect-atom/atom-react";
import {
	MermaidDiagram,
	MermaidProvider,
	useMermaidInitialized,
} from "effect-mermaid-react";
import { useEffect, useState } from "react";
import "./App.css";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor";
import { RenderingSettingsPanel } from "./components/RenderingSettingsPanel";
import { ThemeBuilderSidebar } from "./components/ThemeBuilderSidebar";
import { useRegisterCustomThemes } from "./hooks/useRegisterCustomThemes";
import { useRenderingSettings } from "./hooks/useRenderingSettings";
import { useThemeBuilder } from "./hooks/useThemeBuilder";
import { buttonClasses } from "./utils/buttonClasses";
import { getSyntaxErrorsWithContext } from "./utils/syntaxChecker";

// Fixed MermaidProvider initialization

const DEFAULT_DIAGRAM = `graph LR
    A[Start] --> B{Condition}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`;

type AllThemes = "default" | "dark" | "forest" | "neutral";

interface SyntaxErrorInfo {
	errors: Array<{
		line: number;
		column?: number;
		message: string;
		type: "error" | "warning";
	}>;
	diagnostics: string[];
}

function EditorContent() {
	const [code, setCode] = useState(DEFAULT_DIAGRAM);
	const [diagramError, setDiagramError] = useState<Error | null>(null);
	const [syntaxErrors, setSyntaxErrors] = useState<SyntaxErrorInfo>({
		errors: [],
		diagnostics: [],
	});
	const isInitialized = useMermaidInitialized();
	const [lineCount, setLineCount] = useState(
		DEFAULT_DIAGRAM.split("\n").length,
	);
	const [redrawKey, setRedrawKey] = useState(0);
	const [showDiagram, setShowDiagram] = useState(true);

	// Use theme from theme builder
	const {
		currentTheme,
		customThemes,
		allThemeNames,
		sidebarOpen: themeBuilderOpen,
	} = useThemeBuilder();
	const theme = currentTheme;

	// Use rendering settings for element-level controls
	const {
		renderConfig,
		showSettingsPanel,
		setShowSettingsPanel,
		updateNodes,
		updateEdges,
		updateLabels,
		updateLayout,
		updateContainer,
		applyPreset,
		resetToDefaults,
		exportConfig,
		getMermaidConfig,
	} = useRenderingSettings();

	// Register custom themes with Mermaid
	useRegisterCustomThemes(
		customThemes as Record<
			string,
			{ name: string; colors: Record<string, string>; description?: string }
		>,
	);

	// Check syntax when code changes
	useEffect(() => {
		const checkSyntax = async () => {
			const result = await getSyntaxErrorsWithContext(code);
			setSyntaxErrors(result);
		};

		// Debounce syntax checking to avoid too many checks
		const timer = setTimeout(() => {
			checkSyntax();
		}, 500);

		return () => clearTimeout(timer);
	}, [code]);

	const handleCodeChange = (newCode: string) => {
		setCode(newCode);
		setLineCount(newCode.split("\n").length);
		setDiagramError(null); // Clear error when user edits code
	};

	const handleClear = () => {
		if (confirm("Clear editor?")) {
			setCode("");
			setLineCount(1);
		}
	};

	const handleReset = () => {
		setCode(DEFAULT_DIAGRAM);
		setLineCount(DEFAULT_DIAGRAM.split("\n").length);
	};

	const handleRedraw = () => {
		setDiagramError(null);
		// Force a complete re-render by temporarily hiding and showing the diagram
		setShowDiagram(false);
		setTimeout(() => {
			setShowDiagram(true);
			setRedrawKey((prev) => prev + 1);
		}, 0);
	};

	// Add theme builder sidebar
	const { selectTheme } = useThemeBuilder();

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
	};

	if (!isInitialized) {
		return (
			<div className="container">
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100vh",
						gap: "0.5rem",
					}}
				>
					<div className="loading-spinner" />
					<span>Initializing Mermaid...</span>
				</div>
			</div>
		);
	}

	return (
		<>
			<ThemeBuilderSidebar />
			<RenderingSettingsPanel
				renderConfig={renderConfig}
				showSettingsPanel={showSettingsPanel}
				setShowSettingsPanel={setShowSettingsPanel}
				updateNodes={updateNodes}
				updateEdges={updateEdges}
				updateLabels={updateLabels}
				updateLayout={updateLayout}
				updateContainer={updateContainer}
				applyPreset={applyPreset}
				resetToDefaults={resetToDefaults}
				exportConfig={exportConfig}
			/>
			<div className="flex flex-row h-screen bg-background transition-all duration-300">
				{/* Editor Panel */}
				<div className="flex-1 flex flex-col bg-background overflow-hidden border-r border-border md:flex-col md:border-r-0 md:border-b">
					<div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border gap-4 flex-shrink-0 h-14">
						<h2 className="m-0 text-base font-semibold text-foreground">
							Diagram Code
						</h2>
						<div className="flex gap-2 items-center flex-nowrap">
							<button
								className={buttonClasses.small}
								type="button"
								onClick={handleCopy}
								title="Copy to clipboard"
							>
								📋 Copy
							</button>
							<button
								className={buttonClasses.small}
								type="button"
								onClick={handleRedraw}
								title="Redraw diagram"
							>
								🔄 Redraw
							</button>
							<button
								className={buttonClasses.small}
								type="button"
								onClick={handleReset}
								title="Reset to example"
							>
								↺ Reset
							</button>
							<button
								className={buttonClasses.small}
								type="button"
								onClick={handleClear}
								title="Clear editor"
							>
								🗑️ Clear
							</button>
						</div>
					</div>
					<div className="flex-1 flex flex-col overflow-hidden">
						<CodeMirrorEditor
							value={code}
							onChange={handleCodeChange}
							placeholder="Enter Mermaid diagram syntax here..."
						/>
						<div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground flex justify-between items-center">
							<span>
								{lineCount} line{lineCount !== 1 ? "s" : ""} • {code.length}{" "}
								characters
							</span>
							{syntaxErrors.errors.length > 0 && (
								<span className="text-destructive ml-auto">
									⚠️ {syntaxErrors.errors.length} syntax error
									{syntaxErrors.errors.length !== 1 ? "s" : ""}
								</span>
							)}
						</div>
						{(syntaxErrors.errors.length > 0 ||
							syntaxErrors.diagnostics.length > 0) && (
							<div className="px-4 py-3 bg-destructive/10 border-t border-b border-border max-h-52 overflow-y-auto text-sm">
								{syntaxErrors.errors.length > 0 && (
									<div className="mb-2">
										<h4 className="m-0 mb-2 text-destructive font-semibold">
											Syntax Errors
										</h4>
										<ul className="m-0 pl-6 list-disc">
											{syntaxErrors.errors.map((error) => {
												const key = `${error.line}-${error.column ?? "col"}-${error.message}`;
												return (
													<li
														key={key}
														className="mb-2 text-xs text-destructive"
													>
														<strong>Line {error.line}:</strong> {error.message}
													</li>
												);
											})}
										</ul>
									</div>
								)}
								{syntaxErrors.diagnostics.length > 0 && (
									<div className={syntaxErrors.errors.length > 0 ? "mt-2" : ""}>
										<h4 className="m-0 mb-2 text-warning font-semibold">
											Suggestions
										</h4>
										<ul className="m-0 pl-6 list-disc">
											{syntaxErrors.diagnostics.map((diag) => (
												<li key={diag} className="mb-2 text-xs text-warning">
													{diag}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Preview Panel */}
				<div className="relative flex flex-col flex-1 min-h-0">
					<div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border gap-4 flex-shrink-0 h-14">
						<h2 className="m-0 text-base font-semibold text-foreground">
							Diagram Preview
						</h2>
						<div className="flex gap-1 items-center flex-nowrap">
							{allThemeNames.map((t) => (
								<button
									key={t}
									type="button"
									className={
										theme === t
											? buttonClasses.smallActive
											: buttonClasses.small
									}
									onClick={() => selectTheme(t)}
									title={`Switch to ${t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")} theme`}
									aria-pressed={theme === t}
								>
									{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
								</button>
							))}
						</div>
					</div>
					<div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-background">
						{diagramError && (
							<div className="border border-destructive rounded-lg p-6 bg-destructive/10 text-destructive max-w-md">
								<div className="font-semibold mb-2">❌ Diagram Error</div>
								<div className="font-mono text-sm whitespace-pre-wrap break-words opacity-90 mb-3">
									{diagramError.message || String(diagramError)}
								</div>
								<button
									type="button"
									onClick={() => setDiagramError(null)}
									className="px-3 py-1 bg-destructive text-white border-none rounded text-xs font-medium cursor-pointer hover:bg-destructive/90 transition-colors"
									aria-label="Dismiss diagram error"
								>
									Dismiss
								</button>
							</div>
						)}
						{!diagramError && showDiagram && (
							<MermaidDiagram
								key={redrawKey}
								diagram={code}
								config={{
									theme,
									themeVariables: getMermaidConfig(),
								}}
								onError={(error) => {
									setDiagramError(error);
									console.error("Diagram error:", error);
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export function App() {
	return (
		<RegistryProvider>
			<MermaidProvider>
				<EditorContent />
			</MermaidProvider>
		</RegistryProvider>
	);
}
