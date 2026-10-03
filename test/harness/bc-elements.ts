// The slice of BC's Element* helpers (Scripts/Element.js) that LSCG's DOM kit calls, with the same markup and the
// one rule that matters here: a given id may only exist once in the page ("Element ... already exists").
function make<K extends keyof HTMLElementTagNameMap>(tag: K, id: string | null | undefined, cls: string[]): HTMLElementTagNameMap[K] {
	if (id && document.getElementById(id)) throw new Error(`Element "${id}" already exists`);
	const el = document.createElement(tag);
	if (id) el.id = id;
	el.classList.add(...cls);
	return el;
}

export function installBcElements(g: any): void {
	g.ElementCheckbox = {
		Create(id: string | null, onChange: ((this: HTMLInputElement, e: Event) => any) | null, options: any, htmlOptions: any) {
			const el = make("input", id, ["checkbox"]);
			el.type = "checkbox";
			el.checked = !!options?.checked;
			el.disabled = !!options?.disabled;
			for (const [k, v] of Object.entries(htmlOptions?.checkbox?.attributes ?? {}))
				el.setAttribute(k, String(v));
			if (onChange) el.addEventListener("change", onChange);
			return el;
		},
	};
	g.ElementDropdown = {
		Create(id: string | null, optionsList: any[], onChange: (this: HTMLSelectElement, e: Event) => any) {
			const el = make("select", id, ["dropdown"]);
			for (const o of optionsList) {
				const opt = document.createElement("option");
				if (typeof o === "string") { opt.value = o; opt.textContent = o; }
				else { opt.value = o.attributes?.value ?? ""; opt.textContent = (o.children ?? []).join(""); }
				el.append(opt);
			}
			el.addEventListener("change", onChange);
			return el;
		},
	};
	g.ElementText = {
		CreateNote(contents: string) {
			const p = document.createElement("p");
			p.classList.add("lscg-note-stub");
			p.textContent = contents;
			return p;
		},
	};
	// ElementButton already exists as a hook-target stub holder; add Create to it.
	g.ElementButton = g.ElementButton ?? {};
	g.ElementButton.Create = (id: string | null, onClick: ((this: HTMLButtonElement, e: Event) => any) | null, options: any, htmlOptions: any) => {
		const el = make("button", id, ["blank-button", "button", "button-styling"]);
		el.type = "button";
		el.disabled = !!options?.disabled;
		el.classList.add(...(htmlOptions?.button?.classList ?? []).filter(Boolean));
		if (options?.label != null) {
			const label = document.createElement("span");
			label.classList.add("button-label", `button-label-${options.labelPosition ?? "center"}`);
			label.append(options.label);
			el.append(label);
		}
		if (onClick) el.addEventListener("click", onClick as any);
		return el;
	};
}
