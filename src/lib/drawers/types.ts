import type { EdgeGroupPosition, Parameters } from 'dockview';

export type DrawerSide = EdgeGroupPosition;

/** A panel `<DockviewDrawer>` adds when it creates its edge group. */
export interface DrawerPanelOptions {
	id: string;
	/** Name registered in `components` (or handled by the `panel` snippet). */
	component: string;
	title?: string;
	params?: Parameters;
	tabComponent?: string;
	/** Add without making it the drawer's selected tab. */
	inactive?: boolean;
}
