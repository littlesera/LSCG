// Text helpers for fingerprinting BC source: pull one function or class method out of a file by name, and reduce it to a
// form that ignores comments and formatting. Not a JavaScript parser; it understands strings, template literals,
// comments, and braces, which is all the BC map functions use.

/** Removes line and block comments, outside of strings and template literals. */
function stripComments(src: string): string {
	let out = "";
	for (let i = 0; i < src.length;) {
		const c = src[i], n = src[i + 1];
		if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
		if (c === "/" && n === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
		if (c === "'" || c === '"' || c === "`") {
			const quote = c;
			out += c; i++;
			while (i < src.length && src[i] !== quote) {
				if (src[i] === "\\") { out += src[i++]; }
				out += src[i++];
			}
			out += quote; i++;
			continue;
		}
		out += c; i++;
	}
	return out;
}

/** Comment-free, whitespace-collapsed source, so edits that do not change behaviour do not change the hash. */
export function normalizeSource(src: string): string {
	return stripComments(src).replace(/\s+/g, " ").trim();
}

/**
 * Source text of `function name(...) {...}` (or `async function`), or of a class method `name(...) {...}`.
 * Returns null when it is not found.
 */
export function extractSource(file: string, name: string, kind: "function" | "method"): string | null {
	const code = stripComments(file);
	const header = kind === "function"
		? new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`)
		: new RegExp(`^[ \\t]+(?:async\\s+)?${name}\\s*\\([^)]*\\)\\s*\\{`, "m");
	const match = header.exec(code);
	if (!match) return null;
	const open = code.indexOf("{", match.index + match[0].length - (kind === "method" ? 1 : 0));
	if (open < 0) return null;
	let depth = 0;
	for (let i = open; i < code.length; i++) {
		const c = code[i];
		if (c === "'" || c === '"' || c === "`") {
			const quote = c;
			i++;
			while (i < code.length && code[i] !== quote) { if (code[i] === "\\") i++; i++; }
			continue;
		}
		if (c === "{") depth++;
		else if (c === "}" && --depth === 0) return code.slice(match.index, i + 1);
	}
	return null;
}
