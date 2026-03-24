/**
 * PWA install prompt store
 * Captures the browser's `beforeinstallprompt` event so we can trigger it manually.
 */

let deferredPrompt = $state<any>(null);
let isInstalled = $state(false);
let isInstallable = $state(false);

export const pwaStore = {
  get deferredPrompt() { return deferredPrompt; },
  get isInstalled() { return isInstalled; },
  get isInstallable() { return isInstallable; },

  init() {
    // Listen for the install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      isInstallable = true;
    });

    // Detect when app is installed
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      isInstalled = true;
      isInstallable = false;
    });

    // Check if already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled = true;
      isInstallable = false;
    }
  },

  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) return 'unavailable';
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      isInstalled = true;
      isInstallable = false;
    }
    return outcome as 'accepted' | 'dismissed';
  }
};
