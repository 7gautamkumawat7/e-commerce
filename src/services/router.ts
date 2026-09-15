import type { ViewType, AccountTab } from '../types.js';

type RouteListener = (view: ViewType, tab?: AccountTab) => void;
const listeners: Set<RouteListener> = new Set();

let currentView: ViewType = 'store';
let currentTab: AccountTab = 'profile';

export function getCurrentRoute(): { view: ViewType; tab: AccountTab } {
  return { view: currentView, tab: currentTab };
}

export function subscribeRoute(listener: RouteListener): () => void {
  listeners.add(listener);
  listener(currentView, currentTab);
  return () => listeners.delete(listener);
}

function notifyRoute(): void {
  listeners.forEach(fn => fn(currentView, currentTab));
}

export function navigateTo(view: ViewType, tab: AccountTab = 'profile'): void {
  currentView = view;
  currentTab = tab;

  if (view === 'account') {
    window.location.hash = `/account/${tab}`;
  } else {
    window.location.hash = '/';
  }

  notifyRoute();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function initRouter(): void {
  const parseHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash.startsWith('account')) {
      const parts = hash.split('/');
      currentView = 'account';
      currentTab = (parts[1] as AccountTab) || 'profile';
    } else {
      currentView = 'store';
    }
    notifyRoute();
  };

  window.addEventListener('hashchange', parseHash);
  parseHash();
}
