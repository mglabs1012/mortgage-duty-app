import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "rj-duty-calc:pwa-installed";

function readStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function readInstalledFlag(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeInstalledFlag() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* storage unavailable */
  }
}

/**
 * Tracks whether this app can be installed, is already installed, or is
 * already running as the installed PWA — so the UI can show exactly one of
 * Install / Open / nothing, matching what's actually true on this device.
 */
export function usePwaInstall() {
  const [isStandalone] = useState(readStandalone);
  const [isInstalled, setIsInstalled] = useState(readInstalledFlag);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone) return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      writeInstalledFlag();
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // Cross-session self-detection where supported (Chrome/Edge, requires
    // the manifest's related_applications self-entry — see vite.config.ts).
    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<unknown[]>;
    };
    if (typeof nav.getInstalledRelatedApps === "function") {
      nav
        .getInstalledRelatedApps()
        .then((apps) => {
          if (apps.length > 0) {
            writeInstalledFlag();
            setIsInstalled(true);
          }
        })
        .catch(() => {
          /* API unsupported/blocked — fall back to stored flag */
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      writeInstalledFlag();
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const openApp = useCallback(() => {
    // No cross-browser API can force-launch an installed PWA from a regular
    // tab. Where the OS has associated this scope with the installed app,
    // navigating here can hand off to it; otherwise this is a harmless
    // same-tab navigation.
    window.location.href = "/";
  }, []);

  return {
    isStandalone,
    canInstall: !isStandalone && !isInstalled && deferredPrompt !== null,
    canOpen: !isStandalone && isInstalled,
    promptInstall,
    openApp,
  };
}
