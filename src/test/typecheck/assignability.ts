import type { IDockviewPanelProps } from 'dockview';
import type { DockviewSvelteProps } from '../../lib/dockview/types';
import NoProps from './NoProps.svelte';

const components: DockviewSvelteProps['components'] = { none: NoProps };
export default components;
