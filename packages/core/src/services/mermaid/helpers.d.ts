/**
 * Generate a unique ID for Mermaid diagram rendering
 *
 * Creates a random ID with the prefix "mmd-" followed by 6 random characters.
 * This ID is used internally by the Mermaid.js library to uniquely identify
 * diagram containers and manage multiple diagrams on the same page.
 *
 * @returns A unique ID string in the format "mmd-xxxxxx"
 *
 * @example
 * const id = makeRenderId(); // "mmd-a4f2k9"
 * const container = document.getElementById(id);
 */
export declare const makeRenderId: () => string;
/**
 * Validate a diagram string before processing
 *
 * Performs basic validation to ensure the diagram input is valid:
 * - Checks if input is a non-empty string
 * - Trims whitespace and verifies content exists
 *
 * This is a lightweight pre-validation check. Full syntax validation
 * is performed by Mermaid.js during rendering.
 *
 * @param diagram - The diagram source code to validate
 * @returns Error message describing the validation failure, or null if valid
 *
 * @example
 * const error = validateDiagram("   "); // "Diagram cannot be empty"
 * const error = validateDiagram("graph TD\n  A-->B"); // null (valid)
 *
 * @see {@link detectDiagramType} for full diagram syntax validation and type detection
 */
export declare const validateDiagram: (diagram: string) => string | null;
//# sourceMappingURL=helpers.d.ts.map