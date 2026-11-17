/**
 * Whether this is a development build (`npm run watch` / `npm run dev`, which build with `--mode development`), or the browser
 * has opted in with `localStorage.LSCG_DEV = "1"` (to use the developer tools on a released build).
 */
export function isDevBuild(): boolean {
	try {
		if (typeof LSCG_DEV !== "undefined" && LSCG_DEV) return true;
		return localStorage.getItem("LSCG_DEV") === "1";
	} catch {
		return false;
	}
}
