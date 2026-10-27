import { createSubscriber } from 'svelte/reactivity';
import type { DockviewIDisposable } from 'dockview';

type Listen = (fire: () => void) => DockviewIDisposable;

/**
 * Bridges dockview events to Svelte reactivity: the returned function, when
 * called inside an effect or template, subscribes to every event in `listen`
 * and invalidates the reader whenever one fires. Subscriptions exist only while
 * something is reading, and are disposed automatically when nothing is.
 */
export function eventSubscriber(listen: Listen[]): () => void {
	return createSubscriber((update) => {
		const disposables = listen.map((on) => on(update));
		return () => {
			for (const disposable of disposables) disposable.dispose();
		};
	});
}
