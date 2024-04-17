import { RemoteGuiSubscreen } from "./remoteBase";
import { Setting } from "Settings/settingBase";
import { LSCGHypnoInstruction, SUGGESTION_LIMIT } from "Settings/Models/hypno";
import { getActivities, ICONS, getActivityLabel, getZoneColor, replace_template, sendLSCGCommandBeep, isCloth } from "utils";
import { RemoteHypno } from "./hypno";
import { HypnoInstruction, HypnoSuggestion } from "Modules/hypno";
import { getModule } from "modules";
import { CommandListener, CoreModule } from "Modules/core";

export interface PoseSelection {
	upper: AssetPoseName | undefined | "";
	lower: AssetPoseName | undefined | "";
	full: AssetPoseName | undefined | "";
}

export interface ActivitySelection {
	name: string;
	group : string;
}

export interface ClothingSelection {
	all: boolean;
	groups: string[];
}

export interface ForgetSelection {
	all: boolean;
	instructions: LSCGHypnoInstruction[];
}

export class RemoteSuggestions extends RemoteHypno {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Suggestions";
	}

	get icon(): string {
		return ICONS.PENDANT;
	}

	get disabledReason(): string {
		let reason = super.disabledReason;
		if (reason == "Section is Unavailable" && !this.settings.allowSuggestions)
			return replace_template("%OPP_NAME% is resisting any hypnotic suggestions...", this.Character)
		return reason;
	}

	get enabled(): boolean {
		var isTrance = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		return super.enabled && isTrance && this.settings.allowSuggestions;
	}

	Load(): void {
		if (!!this.Character.MemberNumber)
			sendLSCGCommandBeep(this.Character.MemberNumber, "get-suggestions", []);

		getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
			id: "remote_suggestion",
			command: "get-suggestions-response",
			func: (sender: number, msg: LSCGMessageModel) => {
				if (sender == this.Character.MemberNumber)
					this.Suggestions = msg.command?.args.find(a => a.name == "suggestions")?.value as HypnoSuggestion[];
				super.Load();
			}
		});

		ElementCreateInput(this.configFieldId, "text", "", -1);
	}

	Exit(): void {
		super.Exit();

		if (!!this.Character.MemberNumber)
			sendLSCGCommandBeep(this.Character.MemberNumber, "set-suggestions", [{
				name: "suggestions",
				value: this.Suggestions?.filter(s => !!s.trigger) ?? []
			}, {
				name: "removed",
				value: this.RemovedSuggestions
			}]);
		getModule<CoreModule>("CoreModule").RemoveCommandListenerById("remote_suggestion");
		ElementRemove(this.configFieldId);
		Player.FocusGroup = null;
		this._ConfigureInstruction = null;
		this._SelectConfigureInstruction = null;
	}

	Run(): void {
		if (!!this._ConfigureInstruction) {
			return this.drawConfigurePopup();
		} else if (!!this._SelectConfigureInstruction) {
			this.ElementHide(this.configFieldId);
			return this.drawSelectionPopup();
		} else if (!this.Suggestions) {
			this.hideDefinedStructure();
			this.ElementHide(this.configFieldId);
			DrawTextFit("Loading...", 100, 100, 400, "Black");
		} else {
			this.ElementHide(this.configFieldId);
			super.Run();
			var prev = MainCanvas.textAlign;
			if (PreferencePageCurrent == 1) {
				MainCanvas.textAlign = "center";

				if (!!this.Suggestion && !ElementValue("suggestionTrigger")) {
					DrawText("*", 1400, this.getYPos(1)+10, "Red", "Black");
					if (MouseHovering(1410-32, this.getYPos(1)-16, 64, 64))
						this.Tooltip("Trigger phrase required");
				}

				if (this.Suggestions.length > 0 && !!this.Suggestion) {
					DrawBackNextButton(550, this.getYPos(0)-32, 600, 64, this.Suggestion.name, "White", "", () => "Previous", () => "Next");
					DrawButton(1180 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Suggestion.name}`); // Delete Current Button
					DrawImageResize("Icons/Trash.png", 1180, this.getYPos(0) - 32, 64, 64);

					// Draw Instruction Pickers
					this.drawInstructionSelector(0);
					if (this.Suggestion.instructions.length > 0) this.drawInstructionSelector(1);
					if (this.Suggestion.instructions.length > 1) this.drawInstructionSelector(2);

					DrawButton(1260 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Rename Suggestion`, !this.IsSuggestionOwner); // Add New Suggestion
					DrawImageResize("Icons/Title.png", 1260, this.getYPos(0) - 32, 64, 64);
				}
				else {
					DrawTextFit("No Suggestions Yet...", 780, this.getYPos(0), 600, "#CBC3E3", "Black");
				}

				DrawButton(1340 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Induce New Suggestion`); // Add New Suggestion
				DrawImageResize("Icons/Plus.png", 1340, this.getYPos(0) - 32, 64, 64);

				if (!!this.Suggestion) {
					MainCanvas.textAlign = "left";
					DrawTextFit(`Installed by: ${this.Suggestion.installedByName} [${this.Suggestion.installedBy}]`, 1420, this.getYPos(0), 400, "grey", "black");
					MainCanvas.textAlign = "center";
				}
			}
			MainCanvas.textAlign = prev;
		}
	}

	Click(): void {
		if (!!this._ConfigureInstruction) {
			return this.clickConfigurePopup();
		} else if (!!this._SelectConfigureInstruction) {
			return this.clickSelectionPopup();
		}
		super.Click();
		if (!!this.Suggestions && PreferencePageCurrent == 1) {
			if (MouseIn(550, this.getYPos(0) - 32, 600, 64)) {
				// Change Suggestion
				this.saveSuggestion();
				this.SuggestionIndex = this.GetNewIndexFromNextPrevClick(850, this.SuggestionIndex, this.Suggestions.length);
				this.loadSuggestion();
			}
			else if (MouseIn(1180, this.getYPos(0) - 32, 64, 64) && this.Suggestions.length > 0 && this.IsSuggestionOwner) {
				// Remove Suggestion
				let removed = this.Suggestions.splice(this.SuggestionIndex, 1);
				if (this.SuggestionIndex >= this.Suggestions.length)
					this.SuggestionIndex = this.Suggestions.length - 1;
				this.loadSuggestion();
				this.RemovedSuggestions.push(...removed);
			} else if (MouseIn(1260, this.getYPos(0) - 32, 64, 64) && this.Suggestions.length > 0 && this.IsSuggestionOwner) {
				// Rename Suggestion
				if (!!this.Suggestion) {
					this.saveSuggestion();
					this.renameSuggestion();
				}
			} else if (MouseIn(1340, this.getYPos(0) - 32, 64, 64) && this.Suggestions.length < SUGGESTION_LIMIT) {
				// New Suggestion
				if (!!this.Suggestion)
					this.saveSuggestion();
				this.Suggestions.push(new HypnoSuggestion(`Suggestion No. ${this.Suggestions.length+1}`));
				this.SuggestionIndex = this.Suggestions.length - 1;
				this.renameSuggestion();
			}

			if (!!this.Suggestion) {
				// Handle Instruction Clicks
				this.clickInstructionSelector(0);
				if (this.Suggestion.instructions.length > 0) this.clickInstructionSelector(1);
				if (this.Suggestion.instructions.length > 1) this.clickInstructionSelector(2);				
			}
		}
	}

	renameSuggestion() {
		let tempInstruction = new HypnoInstruction(LSCGHypnoInstruction.none);
		tempInstruction.arguments["config"] = this.Suggestion?.name;
		this.TextConfigureInstruction(tempInstruction);
	}

	hideDefinedStructure() {
		this.multipageStructure.forEach((s, ix, arr) => {
			s.forEach(setting => {
				if (setting.type == "text" || setting.type == "number" || setting.type == "dropdown")
					this.ElementHide(setting.id);
			})
		});
	}

	drawConfigurePopup() {
		this.hideDefinedStructure();
		DrawRect(0, 0, 2000, 1000, "rgba(0,0,0,.5)");
		let coords = {x: 500, y: 400, w: 1000, h: 200};
		let buttonWidth = 150;
		DrawRect(coords.x, coords.y, coords.w, coords.h, "White");
		DrawEmptyRect(coords.x, coords.y, coords.w, coords.h, "Black", 5);
		DrawEmptyRect(coords.x+5, coords.y+5, coords.w-10, coords.h-10, "Grey", 2);
		MainCanvas.textAlign = "left";
		let configLabels = this.configLabels(this._ConfigureInstruction?.type ?? LSCGHypnoInstruction.none);
		DrawTextFit(`${configLabels[0]}:`, coords.x + 50, (coords.y + coords.h/2) - 50, coords.w - 100 - buttonWidth, "Black", "Grey");
		if (MouseHovering(coords.x + 50, (coords.y + coords.h/2) - 50 - 32, coords.w - 100 - buttonWidth, 64))
			this.Tooltip(configLabels[1]);
		MainCanvas.textAlign = "center";
		ElementPosition(this.configFieldId, coords.x + (coords.w/2) - (buttonWidth/2), (coords.y + coords.h/2) + 20, coords.w - 100 - buttonWidth);
		DrawButton(1350, 500 - 32, 100, 64, "Confirm", "White");
	}

	drawSelectionPopup() {
		this.hideDefinedStructure();
		DrawRect(0, 0, 2000, 1000, "rgba(0,0,0,.5)");
		let coords = {x: 500, y: 100, w: 1000, h: 800};

		// Set customized Size?
		switch (this._SelectConfigureInstruction?.type) {
			case LSCGHypnoInstruction.activity:
				break;
			case LSCGHypnoInstruction.pose:
				break;
			case LSCGHypnoInstruction.strip:
				coords = {x: 600, y: 100, w: 800, h: 800};
				break;
			case LSCGHypnoInstruction.forget:
				coords = {x: 800, y: 200, w: 600, h: 600};
				break;
		}

		// Draw Popup Box
		DrawRect(coords.x, coords.y, coords.w, coords.h, "White");
		DrawEmptyRect(coords.x, coords.y, coords.w, coords.h, "Black", 5);
		DrawEmptyRect(coords.x + 5, coords.y + 5, coords.w - 10, coords.h - 10, "Grey", 2);
		MainCanvas.textAlign = "center";
		DrawButton(coords.x + coords.w - 130, coords.y + coords.h - 84, 100, 64, "Confirm", "White");
		MainCanvas.textAlign = "left";

		// Draw Selection listing
		if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.activity) {
			// - Activity: Activity selector (many)
			let currentValue = this._selectionValue as ActivitySelection;
			if (!currentValue) {
				this._selectionValue = <ActivitySelection>{name: "", group: ""};
				currentValue = this._selectionValue as ActivitySelection;
			}
			DrawTextFit(`Select Activity:`, coords.x + (coords.w / 2), coords.y + 50, coords.w - 100, "Black", "Grey");
			if (MouseHovering(coords.x + (coords.w / 2), coords.y + 50 - 32, coords.w - 100, 64))
				this.Tooltip("Select an activity for this instruction");

			// Draws all the available character zones
			DrawCharacter(this.Character, coords.x + 50, coords.y + 60, 0.7, false);
			MainCanvas.textAlign = "left";
			
			for (let Group of AssetGroup) {
				let activitiesByGroup = getActivities(Group);
				if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length) {
					let groupContainsSelection = Group.Name == currentValue?.group;
					DrawAssetGroupZone(Player, Group.Zone, 0.7, coords.x + 50, coords.y + 60, 1, "#808080FF", 3, getZoneColor(Group.Name, groupContainsSelection));
				}
			}

			if (Player.FocusGroup != null) {
				let activity = getActivities()[this._activityIndex ?? 0];
				DrawAssetGroupZone(Player, Player.FocusGroup.Zone, 0.7, coords.x + 50, coords.y + 60, 1, "cyan");
				MainCanvas.textAlign = "center";
				DrawBackNextButton(coords.x + (coords.w/2), coords.y + 380, 300, 64, getActivityLabel(activity, Player.FocusGroup), "White", "", () => "", () => "");
				MainCanvas.textAlign = "left";
				if (!!activity) {
					let image = "Assets/" + Player.AssetFamily + "/Activity/" + activity.Name + ".png";
					if (activity.Name.indexOf("Item") > -1) {
						image = "Icons/Dress.png";
					}
					DrawImageResize(image, coords.x + (coords.w/2) + 300 + 20, coords.y + 380 - 28, 120, 120);
					DrawEmptyRect(coords.x + (coords.w/2) + 300 + 20, coords.y + 380 - 28, 120, 120, "Black", 2);
				}
			} else {
				DrawText("Please Select a Zone", coords.x + (coords.w / 2), coords.y + 200, "Black", "White");
			}
		} else if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.pose) {
			// - Pose: Post listing (upper, lower, all/override)
			let currentValue = this._selectionValue as PoseSelection;
			if (!currentValue) {
				this._selectionValue = <PoseSelection>{lower: "", upper: "", full: ""};
				currentValue = this._selectionValue as PoseSelection;
			}
			let upperPoses = PoseFemale3DCG.filter(p => p.Category == "BodyUpper");
			let lowerPoses = PoseFemale3DCG.filter(p => p.Category == "BodyLower");
			let fullPoses = PoseFemale3DCG.filter(p => p.Category == 'BodyFull');
			let fullSelected = !!currentValue.full;

			DrawTextFit("Upper Pose:", coords.x + 20, coords.y + 50, 200, "Black", "");
			this.DrawCheckboxAbsolute("None", "", !currentValue.upper, {
				x: coords.x + 20,
				y: coords.y + 120,
				w: 200
			});
			upperPoses.forEach((pose, ix, arr) => {
				this.DrawCheckboxAbsolute(pose.Name, "", currentValue.upper == pose.Name, {
					x: coords.x + 20,
					y: coords.y + 200 + (80*ix),
					w: 200
				}, fullSelected);
			});

			DrawTextFit("Lower Pose:", coords.x + 320, coords.y + 50, 200, "Black", "");
			this.DrawCheckboxAbsolute("None", "", !currentValue.lower, {
				x: coords.x + 320,
				y: coords.y + 120,
				w: 200
			});
			lowerPoses.forEach((pose, ix, arr) => {
				this.DrawCheckboxAbsolute(pose.Name, "", currentValue.lower == pose.Name, {
					x: coords.x + 320,
					y: coords.y + 200 + (80*ix),
					w: 200
				}, fullSelected);
			});

			DrawTextFit("Full Pose:", coords.x + 620, coords.y + 50, 200, "Black", "");
			this.DrawCheckboxAbsolute("None", "", !currentValue.full, {
				x: coords.x + 620,
				y: coords.y + 120,
				w: 200
			});
			fullPoses.forEach((pose, ix, arr) => {
				this.DrawCheckboxAbsolute(pose.Name, "", currentValue.full == pose.Name, {
					x: coords.x + 620,
					y: coords.y + 200 + (80*ix),
					w: 200
				});
			});
		} else if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.strip) {
			// - Strip: Clothing slot listing (22, multiselect)
			let coords = {x: 600, y: 100, w: 800, h: 800};
			let currentValue = this._selectionValue as ClothingSelection;
			if (!currentValue) {
				this._selectionValue = <ClothingSelection>{all: false, groups: []};
				currentValue = this._selectionValue as ClothingSelection;
			}

			DrawButton(coords.x + 20, coords.y + 20, 64, 64, "", "White", "", "Previous");
			DrawImageResize("Icons/Prev.png", coords.x + 22, coords.y + 22, 60, 60);
			DrawButton(coords.x + coords.w - 86, coords.y + 20, 64, 64, "", "White", "", "Next");
			DrawImageResize("Icons/Next.png", coords.x + coords.w - 86, coords.y + 22, 60, 60);
			
			this.DrawCheckboxAbsolute("All Slots", "", currentValue.all, {
				x: coords.x + coords.w/2 - 100,
				y: coords.y + 20 + 32,
				w: 100
			});

			DrawTextFit("Select Clothing Slots:", coords.x + 20, coords.y + 120, 600, "Black", "");

			let columns = this._getClothingSlotColumns();
			columns[0].forEach((slot, ix, arr) => {
				this.DrawCheckboxAbsolute(slot, "", currentValue.all || currentValue.groups.indexOf(slot) > -1, {
					x: coords.x + 20,
					y: coords.y + 200 + (80*ix),
					w: 200
				}, currentValue.all);
			});
			columns[1].forEach((slot, ix, arr) => {
				this.DrawCheckboxAbsolute(slot, "", currentValue.all || currentValue.groups.indexOf(slot) > -1, {
					x: coords.x + 400,
					y: coords.y + 200 + (80*ix),
					w: 200
				}, currentValue.all);
			});
		} else if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.forget) {
			let currentValue = this._selectionValue as ForgetSelection;
			if (!currentValue) {
				this._selectionValue = <ForgetSelection>{all: false, instructions: []};
				currentValue = this._selectionValue as ForgetSelection;
			}

			this.DrawCheckboxAbsolute("All Instructions", "", currentValue.all, {
				x: coords.x + coords.w/2 - 200,
				y: coords.y + 20 + 32,
				w: 200
			});

			DrawTextFit("Select Instructions to Forget:", coords.x + 20, coords.y + 120, 600, "Black", "");

			this.forgettableInstruction.forEach((instruction, ix, arr) => {
				this.DrawCheckboxAbsolute(instruction, "", currentValue.all || currentValue.instructions.indexOf(instruction) > -1, {
					x: coords.x + 100,
					y: coords.y + 200 + (80*ix),
					w: 200
				}, currentValue.all);
			});
		}
	}

	get _totalClothingSlots(): number {
		return AssetGroup.filter(g => g.Family === this.Character.AssetFamily && g.Category === "Appearance" && g.AllowCustomize && isCloth(g)).length;
	}

	_getClothingSlotColumns(): string[][] {
		let allGroups = AssetGroup.filter(g => g.Family === this.Character.AssetFamily && g.Category === "Appearance" && g.AllowCustomize);
		let startIx = this._clothingPageIndex * this._clothingPerPage
		let perCol = this._clothingPerPage / 2;
		let clothingSlots = allGroups.filter(grp => isCloth(grp, false)).map(grp => grp.Name).slice(startIx, startIx + this._clothingPerPage);
		let colOneSlots = clothingSlots.slice(0, perCol);
		let colTwoSlots = clothingSlots.slice(perCol);
		return [colOneSlots ?? [], colTwoSlots ?? []];
	}

	clickConfigurePopup() {
		let coords = {x: 500, y: 400, w: 1000, h: 200};
		if (!MouseIn(coords.x, coords.y, coords.w, coords.h)) this._ConfigureInstruction = null;
		else if (MouseIn(1350, 500 - 32, 100, 64) && this._ConfigureInstruction?.type == LSCGHypnoInstruction.none) return this.ConfirmSuggestionName();
		else if (MouseIn(1350, 500 - 32, 100, 64)) return this.ConfirmInstructionConfig();
	}

	clickSelectionPopup() {
		let coords = {x: 500, y: 100, w: 1000, h: 800};
		if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.activity) {
			let currentValue = this._selectionValue as ActivitySelection;
			for (const Group of AssetGroup) {
				if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length) {
					const Zone = Group.Zone.find(z => DialogClickedInZone(Player, z, 0.7, coords.x + 50, coords.y + 60, 1));
					if (Zone) {
						Player.FocusGroup = Group;
						currentValue.group = Group.Name;
						let activities = getActivities();
						this._activityIndex = activities.map(a => a.Name).indexOf(currentValue.name);
						if (this._activityIndex == -1 || this._activityIndex >= activities.length)
							this._activityIndex = 0;
					}
				}
			}
			if (Player.FocusGroup != null) {
				let activities = getActivities();
				// Arousal activity control
				if (MouseIn(coords.x + (coords.w/2), coords.y + 380, 300, 64)) {
					if (MouseX <= (coords.x + (coords.w/2) + 150)) this._activityIndex = (activities.length + this._activityIndex - 1) % activities.length;
					else this._activityIndex = (this._activityIndex + 1) % activities.length;
				}
			}
			currentValue.name = getActivities()[this._activityIndex]?.Name;
		} else if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.pose) {
			let currentValue = this._selectionValue as PoseSelection;
			let upperPoses = PoseFemale3DCG.filter(p => p.Category == "BodyUpper");
			let lowerPoses = PoseFemale3DCG.filter(p => p.Category == "BodyLower");
			let fullPoses = PoseFemale3DCG.filter(p => p.Category == 'BodyFull');
			let fullSelected = !!currentValue.full;
			
			if (!fullSelected) {
				if (MouseIn(coords.x + 20, coords.y + 120 - 32, 200 + 64, 60))
					currentValue.upper = "";
				upperPoses.forEach((pose, ix, arr) => {
					if (MouseIn(coords.x + 20, coords.y + 200 + (80*ix) - 32, 200 + 64, 60))
						currentValue.upper = pose.Name;
				});
			}

			if (!fullSelected) {
				if (MouseIn(coords.x + 320, coords.y + 120 - 32, 200 + 64, 60))
					currentValue.lower = "";
				lowerPoses.forEach((pose, ix, arr) => {
					if (MouseIn(coords.x + 320, coords.y + 200 + (80*ix) - 32, 200 + 64, 60))
						currentValue.lower = pose.Name;
				});
			}

			if (MouseIn(coords.x + 620, coords.y + 120 - 32, 200 + 64, 60))
				currentValue.full = "";
			fullPoses.forEach((pose, ix, arr) => {
				if (MouseIn(coords.x + 620, coords.y + 200 + (80*ix) - 32, 200 + 64, 60)) {
					currentValue.upper = "";
					currentValue.lower = "";
					currentValue.full = pose.Name;
				}
			});
		} else if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.strip) {
			coords = {x: 600, y: 100, w: 800, h: 800};
			let currentValue = this._selectionValue as ClothingSelection;
			let maxPageIx = Math.ceil(this._totalClothingSlots/this._clothingPerPage) - 1;
			
			DrawButton(coords.x + 20, coords.y + 20, 64, 64, "", "White", "", "Previous");
			DrawImageResize("Icons/Prev.png", coords.x + 22, coords.y + 22, 60, 60);
			DrawButton(coords.x + coords.w - 86, coords.y + 20, 64, 64, "", "White", "", "Next");
			DrawImageResize("Icons/Next.png", coords.x + coords.w - 86, coords.y + 22, 60, 60);
			
			if (MouseIn(coords.x + 20, coords.y + 20, 64, 64)) {
				// Previous
				this._clothingPageIndex--;
				if (this._clothingPageIndex < 0) this._clothingPageIndex = maxPageIx;
			} else if (MouseIn(coords.x + coords.w - 86, coords.y + 20, 64, 64)) {
				// Next
				this._clothingPageIndex++;
				if (this._clothingPageIndex > maxPageIx) this._clothingPageIndex = 0;
			} else if (MouseIn(coords.x + coords.w/2 - 100, coords.y + 20, 100 + 64, 64)) {
				// All
				currentValue.all = !currentValue.all;
			}

			if (!currentValue.all) {
				let columns = this._getClothingSlotColumns();
				columns[0].forEach((slot, ix, arr) => {
					if (MouseIn(coords.x + 20, coords.y + 200 + (80*ix) - 32, 200 + 64, 64)) {
						if (currentValue.groups.indexOf(slot) == -1) currentValue.groups.push(slot);
						else currentValue.groups.splice(currentValue.groups.indexOf(slot), 1);
					}
				});
				columns[1].forEach((slot, ix, arr) => {
					if (MouseIn(coords.x + 400, coords.y + 200 + (80*ix) - 32, 200 + 64, 64)) {
						if (currentValue.groups.indexOf(slot) == -1) currentValue.groups.push(slot);
						else currentValue.groups.splice(currentValue.groups.indexOf(slot), 1);
					}
				});
				currentValue.groups = currentValue.groups.filter((grp, ix, arr) => arr.indexOf(grp) == ix);
			}
		} else if (this._SelectConfigureInstruction?.type == LSCGHypnoInstruction.forget) {
			coords = {x: 800, y: 200, w: 600, h: 600};
			let currentValue = this._selectionValue as ForgetSelection;
			if (MouseIn(coords.x + coords.w/2 - 200, coords.y + 20, 200 + 64, 64)) {
				// All
				currentValue.all = !currentValue.all;
			}
			this.forgettableInstruction.forEach((instruction, ix, arr) => {
				if (MouseIn(coords.x + 100, coords.y + 200 + (80*ix) - 32, 200 + 64, 64)) {
					if (currentValue.instructions.indexOf(instruction) == -1) currentValue.instructions.push(instruction);
					else currentValue.instructions.splice(currentValue.instructions.indexOf(instruction), 1);
				}
			});
		}

		if (MouseIn(coords.x + coords.w - 130, coords.y + coords.h - 84, 100, 64)) return this.ConfirmSelectionConfig();
	}

	drawInstructionSelector(ix: number) {
		if (!this.Suggestion || this.PreviousInstructionIsTerminating(ix)) {
			return;
		}
		
		let yPos = (ix * 2) + 3;
		if (!this.Suggestion.instructions)
			this.Suggestion.instructions = [];
		let instruction = this.Suggestion.instructions[ix];
		let selfCheck = instruction?.arguments["self"] ?? false;
		DrawBackNextButton(780, this.getYPos(yPos) - 32, 600, 64, this.Suggestion.instructions.length > ix ? instruction?.type : LSCGHypnoInstruction.none, "White", "", () => "", () => "");
		if (ix > 0 && this.Suggestion.instructions.length == ix + 1) {
			DrawButton(1410, this.getYPos(yPos) - 32, 64, 64, "", "White", "", `Delete ${this.Suggestion.name}`); // Delete Instruction
			DrawImageResize("Icons/Trash.png", 1410 + 2, this.getYPos(yPos) - 32 + 2, 60, 60);
		}
		if (this.textArgumentInstruction.indexOf(instruction?.type) > -1) {
			DrawButton(1500, this.getYPos(yPos) - 32, 150, 64, this.configLabels(instruction?.type)[0], selfCheck ? "#D3D3D3" : "White", undefined, this.configLabels(instruction?.type)[1], selfCheck);
		}
		if (this.selfInstructions.indexOf(instruction?.type) > -1) {
			DrawButton(1670, this.getYPos(yPos) - 32, 64, 64, "", selfCheck ? "#90EE90" : "White", "", "Subject will always target themselves", false);
			DrawTextFit("Self", 1670 + 34, this.getYPos(yPos), 45, "Black", "Grey");
		}
		if (this.selectionInstruction.indexOf(instruction?.type) > -1) {
			DrawButton(1750, this.getYPos(yPos) - 32, 64, 64, "", "White", "", "Configure");
			DrawImageResize("Icons/General.png", 1750 + 2, this.getYPos(yPos) - 30, 60, 60);
		}
		MainCanvas.textAlign = "left";
		DrawTextFit(RemoteSuggestions.InstructionDescription(instruction?.type), 780, this.getYPos(yPos + 1), 1000, "Black");
		MainCanvas.textAlign = "center";
	}

	clickInstructionSelector(ix: number) {
		if (!this.Suggestion || this.PreviousInstructionIsTerminating(ix)) {
			return;
		}
		
		let yPos = (ix * 2) + 3;
		if (!this.Suggestion.instructions)
			this.Suggestion.instructions = [];
		let instruction = this.Suggestion.instructions[ix];
		let selfCheck = instruction?.arguments["self"] ?? false;
		if (MouseIn(780, this.getYPos(yPos) - 32, 600, 64)) {
			let instructions = this.AvailableInstructions(ix);
			if (MouseX <= 1080) {
				if (this.Suggestion.instructions.length < ix + 1) this.Suggestion.instructions.push(new HypnoInstruction(instructions[instructions.length - 1]));
				else this.Suggestion.instructions[ix] = new HypnoInstruction(instructions[(instructions.length + instructions.indexOf(instruction?.type) - 1) % instructions.length]);
			}
			else {
				if (this.Suggestion.instructions.length < ix + 1) this.Suggestion.instructions.push(new HypnoInstruction(instructions[0]));
				else this.Suggestion.instructions[ix] = new HypnoInstruction(instructions[(instructions.indexOf(instruction?.type) + 1) % instructions.length]);
			}
		} else if (this.Suggestion.instructions.length > ix && MouseIn(1410, this.getYPos(yPos) - 32, 64, 64)) {
			this.Suggestion.instructions.splice(ix, 1);
		} else if (this.textArgumentInstruction.indexOf(instruction?.type) > -1 && MouseIn(1500, this.getYPos(yPos) - 32, 150, 64)){
			this.TextConfigureInstruction(instruction);
		} else if (this.selfInstructions.indexOf(instruction?.type) > -1 && MouseIn(1670, this.getYPos(yPos) - 32, 64, 64)) {
			instruction.arguments["self"] = !selfCheck;
		} else if (this.selectionInstruction.indexOf(instruction?.type) > -1 && MouseIn(1750, this.getYPos(yPos) - 32, 64, 64)) {
			this.SelectConfigureInstruction(instruction);
		}
	}

	get multipageStructure(): Setting[][] {
		return [[
			<Setting>{
				type: "label",
				label: "Induce Suggestion",
				description: "Induce a new hypnotic suggestion into the subject."
			},<Setting>{
				type: "text",
				label: "Trigger Phrase:",
				description: "Trigger phrase for this suggestion.",
				id: "suggestionTrigger",
				setting: () => this.Suggestion?.trigger ?? "",
				setSetting: (val) => { if (!!this.Suggestion) this.Suggestion.trigger = val},
				hidden: !this.Suggestion,
				overrideWidth: 600
			},<Setting>{
				type: "checkbox",
				label: "Exclusive:",
				description: "If checked, only the creator of this suggestion can view, edit, or trigger it.",
				disabled: !this.IsSuggestionOwner,
				setting: () => this.Suggestion?.exclusive ?? false,
				setSetting: (val) => this.Suggestion!.exclusive = val,
				hidden: !this.Suggestion
			},<Setting>{
				type: "label",
				id: "instruction1",
				label: "Instruction #1:",
				description: "A suggested instruction.",
				options: this.Instructions,
				hidden: !this.Suggestion,
				setting: () => this.Suggestion?.instructions.length ?? 0 > 0 ? (this.Suggestion?.instructions[0] ?? "None") : "None",
				setSetting: (val) => { if (!!this.Suggestion) this.Suggestion.instructions = this.Suggestion.instructions.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
			},<Setting>{
				type: "label", // Blank Spot
				label: "",
				description: ""
			},<Setting>{
				type: "label",
				id: "instruction2",
				label: "Instruction #2:",
				description: "A suggested instruction.",
				options: this.Instructions,
				hidden: !this.Suggestion || this.PreviousInstructionIsTerminating(1),
				setting: () => this.Suggestion?.instructions.length ?? 0 > 1 ? (this.Suggestion?.instructions[1] ?? "None") : "None",
				setSetting: (val) => { if (!!this.Suggestion) this.Suggestion.instructions = this.Suggestion.instructions.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
			},<Setting>{
				type: "label", // Blank Spot
				label: "",
				description: ""
			},<Setting>{
				type: "label",
				id: "instruction3",
				label: "Instruction #3:",
				description: "A suggested instruction.",
				options: this.Instructions,
				hidden: !this.Suggestion || this.PreviousInstructionIsTerminating(2),
				setting: () => this.Suggestion?.instructions.length ?? 0 > 2 ? (this.Suggestion?.instructions[2] ?? "None") : "None",
				setSetting: (val) => { if (!!this.Suggestion) this.Suggestion.instructions = this.Suggestion.instructions.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
			},<Setting>{
				type: "label", // Blank Spot
				label: "",
				description: ""
			}
		]];
	}

	PreviousInstructionIsTerminating(currentIx: number) {
		if (!this.Suggestion || !this.Suggestion.instructions || currentIx <= 0)
			return false;
		return this.terminatingInstruction.indexOf(this.Suggestion.instructions[currentIx-1]?.type ?? LSCGHypnoInstruction.none) > -1;
	}

	configFieldId: string = "instruction_configureField";
	_ConfigureInstruction: HypnoInstruction | null = null;
	_SelectConfigureInstruction: HypnoInstruction | null = null;
	get _configInstructionConfigVal(): string {
		if (!this._ConfigureInstruction) return "";
		else if (!this._ConfigureInstruction.arguments["config"]) this._ConfigureInstruction.arguments["config"] = "";
		return this._ConfigureInstruction.arguments["config"];
	}
	TextConfigureInstruction(instruction: HypnoInstruction) {
		this._ConfigureInstruction = instruction;
		this.ElementSetValue(this.configFieldId, this._configInstructionConfigVal);
	}
	ConfirmInstructionConfig() {
		if (!!this._ConfigureInstruction) this._ConfigureInstruction.arguments["config"] = ElementValue(this.configFieldId);
		this.ElementSetValue(this.configFieldId, "");
		this._ConfigureInstruction = null;
	}
	ConfirmSuggestionName() {
		if (!!this.Suggestion) this.Suggestion.name = ElementValue(this.configFieldId);
		this.ElementSetValue(this.configFieldId, "");
		this._ConfigureInstruction = null;
		this.loadSuggestion();
	}

	_selectionValue: any;
	_activityIndex: number = 0;
	_clothingPageIndex: number = 0;
	_clothingPerPage: number = 14;
	SelectConfigureInstruction(instruction: HypnoInstruction) {
		this._SelectConfigureInstruction = instruction;
		this._selectionValue = this._SelectConfigureInstruction?.arguments["selection"];
	}
	ConfirmSelectionConfig() {
		Player.FocusGroup = null;
		if (!!this._SelectConfigureInstruction) this._SelectConfigureInstruction.arguments["selection"] = this._selectionValue;
		this._SelectConfigureInstruction = null;
	}

	RemovedSuggestions: HypnoSuggestion[] = [];
	Suggestions: HypnoSuggestion[] | undefined = undefined;	
	SuggestionIndex: number = 0;
	get Suggestion(): HypnoSuggestion | undefined {
		if (!this.Suggestions)
			return undefined;
		if (this.SuggestionIndex < 0)
			this.SuggestionIndex = 0;
		if (this.SuggestionIndex >= this.Suggestions.length)
			this.SuggestionIndex = this.Suggestions.length - 1;
		return this.Suggestions[this.SuggestionIndex]
	}

	get IsSuggestionOwner(): boolean {
		return this.Suggestion?.installedBy == Player.MemberNumber;
	}

	AvailableInstructions(ix: number) {
		if (!this.Suggestion)
			return this.ActualInstructions;
		let otherInstructions = this.Suggestion.instructions.map(i => i.type).filter((v, i, arr) => i != ix).filter(i => this.unrepeatableInstruction.indexOf(i) > -1);
		return this.ActualInstructions.filter(eff => otherInstructions.indexOf(eff) == -1 && eff != LSCGHypnoInstruction.follow);
	}
	get Instruction(): LSCGHypnoInstruction {
		return this.ActualInstructions[this.InstructionIndex];
	}
	get ActualInstructions(): LSCGHypnoInstruction[] {
		return this.Instructions.filter(e => e != LSCGHypnoInstruction.none);
	}
	get Instructions(): LSCGHypnoInstruction[] {
		return Object.values(LSCGHypnoInstruction);
	}
	InstructionIndex: number = 0;

	selfInstructions: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.activity
	]

	textArgumentInstruction: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.activity,
		LSCGHypnoInstruction.follow,
		LSCGHypnoInstruction.say
	]

	selectionInstruction: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.activity,
		LSCGHypnoInstruction.strip,
		LSCGHypnoInstruction.pose,
		LSCGHypnoInstruction.forget
	];

	unrepeatableInstruction: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.maid,
		LSCGHypnoInstruction.say,
		LSCGHypnoInstruction.denial,
		LSCGHypnoInstruction.insatiable
	]

	terminatingInstruction: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.maid
	]

	forgettableInstruction: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.denial,
		LSCGHypnoInstruction.insatiable,
		LSCGHypnoInstruction.follow,
		LSCGHypnoInstruction.say
	]

	configLabels(instruction: LSCGHypnoInstruction): [string, string] {
		switch (instruction) {
			case LSCGHypnoInstruction.activity:
			case LSCGHypnoInstruction.follow:
				return ["Target", "Configure specific target member id number or name"];
			case LSCGHypnoInstruction.say:
				return ["Phrase", "Configure specific phrase"];
			case LSCGHypnoInstruction.none:
				return ["Name", "Name this hypnotic suggestion for future reference"];
			default:
				return ["N/A", ""];
		}
	}

	saveSuggestion() {
		// Save all current text field values
		this.structure.forEach((item, ix, arr) => {
			switch (item.type) {
				case "number":
				case "text":
				case "dropdown":
					if (!!ElementValue(item.id))
						item.setSetting(ElementValue(item.id));
					break;
			}
		});
	}

	loadSuggestion() {
		// Load new text element values
		this.structure.forEach((item, ix, arr) => {
			switch (item.type) {
				case "number":
				case "text":
				case "dropdown":
					this.ElementSetValue(item.id, item.setting());
					break;
			}
		});
	}

	static InstructionDescription(instruction: LSCGHypnoInstruction): string {
		switch (instruction) {
			case LSCGHypnoInstruction.activity:
				return "Compel the subject to perform an activity.";
			case LSCGHypnoInstruction.follow:
				return "Compel the subject to follow someone.";
			case LSCGHypnoInstruction.maid:
				return "Compel the subject to serve drinks.";
			case LSCGHypnoInstruction.orgasm:
				return "Induce overwhelming pleasure in the subject.";
			case LSCGHypnoInstruction.pose:
				return "Compel the subject to assume a pose.";
			case LSCGHypnoInstruction.say:
				return "Compel the subject to speak a phrase.";
			case LSCGHypnoInstruction.strip:
				return "Make the subjects clothing uncomfortable.";
			case LSCGHypnoInstruction.denial:
				return "Prevent the subject from achieving orgasm.";
			case LSCGHypnoInstruction.insatiable:
				return "Infuse the subject with an endless arousal.";
			case LSCGHypnoInstruction.forget:
				return "Remove a previous instruction from the subject.";
			case LSCGHypnoInstruction.none:
				return "None";
			default:
				return "";
		}
	}
}