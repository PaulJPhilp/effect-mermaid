import {
	MermaidDiagram,
	MermaidProvider,
	useMermaidInitialized,
} from "effect-mermaid-react";
import { useState, useEffect } from "react";
import { RegistryProvider } from "@effect-atom/atom-react";
import "./App.css";
import { ThemeBuilderSidebar } from "./components/ThemeBuilderSidebar";
import { useThemeBuilder } from "./hooks/useThemeBuilder";
import { useRegisterCustomThemes } from "./hooks/useRegisterCustomThemes";
import { getSyntaxErrorsWithContext } from "./utils/syntaxChecker";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor";

// Fixed MermaidProvider initialization

const DEFAULT_DIAGRAM = `graph LR
    A[Start] --> B{Condition}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`;

type AllThemes = "default" | "dark" | "forest" | "neutral";

interface SyntaxErrorInfo {
	errors: Array<{ line: number; column?: number; message: string; type: 'error' | 'warning' }>
	diagnostics: string[]
}

function EditorContent() {
	const [code, setCode] = useState(DEFAULT_DIAGRAM);
	const [diagramError, setDiagramError] = useState<Error | null>(null);
	const [syntaxErrors, setSyntaxErrors] = useState<SyntaxErrorInfo>({ errors: [], diagnostics: [] });
	const isInitialized = useMermaidInitialized();
	const [lineCount, setLineCount] = useState(
		DEFAULT_DIAGRAM.split("\n").length,
	);
	const [redrawKey, setRedrawKey] = useState(0);
	const [showDiagram, setShowDiagram] = useState(true);

	// Use theme from theme builder
	const { currentTheme, customThemes, allThemeNames } = useThemeBuilder();
	const theme = currentTheme;

	// Register custom themes with Mermaid
	useRegisterCustomThemes(customThemes as Record<string, { name: string; colors: Record<string, string>; description?: string }>);

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

	const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newCode = e.target.value;
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
			setRedrawKey(prev => prev + 1);
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
			<div className="container">
				<div className="panel editor">
				<div className="panel-header">
					<h2>Diagram Code</h2>
					<div className="toolbar">
						<button
							className="btn btn-small"
							type="button"
							onClick={handleCopy}
							title="Copy to clipboard"
						>
							📋 Copy
						</button>
						<button
							className="btn btn-small"
							type="button"
							onClick={handleRedraw}
							title="Redraw diagram"
						>
							🔄 Redraw
						</button>
						<button
							className="btn btn-small"
							type="button"
							onClick={handleReset}
							title="Reset to example"
						>
							↺ Reset
						</button>
						<button
							className="btn btn-small"
							type="button"
							onClick={handleClear}
							title="Clear editor"
						>
							🗑️ Clear
						</button>
					</div>
				</div>
				<div className="editor-wrapper">
					<CodeMirrorEditor
						value={code}
						onChange={handleCodeChange}
						placeholder="Enter Mermaid diagram syntax here..."
					/>
					<div className="editor-status">
						<span>
							{lineCount} line{lineCount !== 1 ? "s" : ""} • {code.length}{" "}
							characters
						</span>
						{syntaxErrors.errors.length > 0 && (
							<span style={{ color: '#ef5350', marginLeft: 'auto' }}>
								⚠️ {syntaxErrors.errors.length} syntax error{syntaxErrors.errors.length !== 1 ? "s" : ""}
							</span>
						)}
					</div>
					{(syntaxErrors.errors.length > 0 || syntaxErrors.diagnostics.length > 0) && (
						<div className="syntax-errors-panel">
							{syntaxErrors.errors.length > 0 && (
								<div className="error-section">
									<h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828' }}>Syntax Errors</h4>
									<ul style={{ margin: '0', padding: '0 0 0 1.5rem', listStyle: 'disc' }}>
										{syntaxErrors.errors.map((error, idx) => (
											<li key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#c62828' }}>
												<strong>Line {error.line}:</strong> {error.message}
											</li>
										))}
									</ul>
								</div>
							)}
							{syntaxErrors.diagnostics.length > 0 && (
								<div className="diagnostic-section" style={{ marginTop: syntaxErrors.errors.length > 0 ? '0.5rem' : 0 }}>
									<h4 style={{ margin: '0 0 0.5rem 0', color: '#f57c00' }}>Suggestions</h4>
									<ul style={{ margin: '0', padding: '0 0 0 1.5rem', listStyle: 'disc' }}>
										{syntaxErrors.diagnostics.map((diag, idx) => (
											<li key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#f57c00' }}>
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

			<div className="panel preview">
				<div className="panel-header">
					<h2>Diagram Preview</h2>
					<div className="toolbar theme-toolbar">
						{allThemeNames.map((t) => (
							<button
								key={t}
								type="button"
								className={`btn btn-small${theme === t ? " btn-active" : ""}`}
								onClick={() => selectTheme(t)}
								title={`Switch to ${t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")} theme`}
								aria-pressed={theme === t}
							>
								{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
							</button>
						))}
					</div>
				</div>
				<div className="diagram-container">
					{diagramError && (
						<div
							style={{
								padding: "1rem",
								backgroundColor: "#ffebee",
								border: "1px solid #ef5350",
								borderRadius: "4px",
								color: "#c62828",
								fontSize: "0.875rem",
							}}
						>
							<div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
								❌ Diagram Error
							</div>
							<div
								style={{
									fontFamily: "monospace",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
								}}
							>
								{diagramError.message || String(diagramError)}
							</div>
							<button
								type="button"
								onClick={() => setDiagramError(null)}
								style={{
									marginTop: "0.5rem",
									padding: "0.25rem 0.75rem",
									background: "#c62828",
									color: "white",
									border: "none",
									borderRadius: "2px",
									cursor: "pointer",
									fontSize: "0.75rem",
								}}
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
							config={{ theme }}
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
