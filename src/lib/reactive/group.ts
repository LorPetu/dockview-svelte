import type {
	DockviewGroupLocation,
	DockviewGroupPanel,
	DockviewHeaderPosition,
	IDockviewPanel
} from 'dockview';
import { eventSubscriber } from './subscriber';

/** Reactive view of a dockview group (including edge groups used as drawers). */
export class ReactiveGroup {
	readonly #panels;
	readonly #active;
	readonly #location;
	readonly #collapsed;
	readonly #header;

	constructor(readonly group: DockviewGroupPanel) {
		const { api, model } = group;
		this.#panels = eventSubscriber([
			(fire) => model.onDidAddPanel(fire),
			(fire) => model.onDidRemovePanel(fire),
			(fire) => model.onDidActivePanelChange(fire)
		]);
		this.#active = eventSubscriber([(fire) => api.onDidActiveChange(fire)]);
		this.#location = eventSubscriber([(fire) => api.onDidLocationChange(fire)]);
		this.#collapsed = eventSubscriber([(fire) => api.onDidCollapsedChange(fire)]);
		this.#header = eventSubscriber([(fire) => api.onDidHeaderDirectionChange(fire)]);
	}

	get id(): string {
		return this.group.id;
	}

	get panels(): IDockviewPanel[] {
		this.#panels();
		return this.group.panels;
	}

	get activePanel(): IDockviewPanel | undefined {
		this.#panels();
		return this.group.activePanel;
	}

	get isActive(): boolean {
		this.#active();
		return this.group.api.isActive;
	}

	get location(): DockviewGroupLocation {
		this.#location();
		return this.group.api.location;
	}

	/** Edge groups only: true while collapsed to their tab strip. */
	get isCollapsed(): boolean {
		this.#collapsed();
		return this.group.api.isCollapsed();
	}

	get headerPosition(): DockviewHeaderPosition {
		this.#header();
		return this.group.model.headerPosition;
	}

	collapse(): void {
		this.group.api.collapse();
	}

	expand(): void {
		this.group.api.expand();
	}

	toggle(): void {
		if (this.group.api.isCollapsed()) this.expand();
		else this.collapse();
	}
}
