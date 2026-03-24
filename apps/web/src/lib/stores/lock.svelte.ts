/**
 * Lock store — manages PIN/biometric app lock state
 * Locks on: initial load (if pinEnabled), visibilitychange hidden, pagehide
 */

import { db } from "../db";

async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

class LockStore {
  isLocked: boolean = $state(false);

  init() {
    if (typeof window === "undefined") return;

    // Lock on visibility hidden (tab switch, screen off)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.lockIfEnabled();
      }
    });

    // Lock on pagehide (leaving the page)
    window.addEventListener("pagehide", () => this.lockIfEnabled());

    // Lock on load if pin enabled
    this.lockIfEnabled();
  }

  async lockIfEnabled() {
    const settings = await db.appSettings.get("singleton");
    if (settings?.pinEnabled && settings?.pinHash) {
      this.isLocked = true;
    }
  }

  async unlock(pin: string): Promise<boolean> {
    const settings = await db.appSettings.get("singleton");
    if (!settings?.pinHash) return true;
    const hash = await hashPin(pin);
    if (hash === settings.pinHash) {
      this.isLocked = false;
      return true;
    }
    return false;
  }

  async unlockWithBiometric(): Promise<boolean> {
    try {
      const settings = await db.appSettings.get("singleton");
      if (!settings?.biometricCredentialId) return false;

      const credentialId = Uint8Array.from(atob(settings.biometricCredentialId), (c) =>
        c.charCodeAt(0),
      );

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ type: "public-key", id: credentialId }],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (assertion) {
        this.isLocked = false;
        return true;
      }
    } catch (e) {
      console.warn("Biometric unlock failed:", e);
    }
    return false;
  }

  async registerBiometric(): Promise<boolean> {
    try {
      const settings = await db.appSettings.get("singleton");
      if (!settings?.pinEnabled || !settings?.pinHash) return false;

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Lowo Budget", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(settings.id),
            name: settings.userName || "lowo_user",
            displayName: settings.userName || "Lowo User",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!credential) return false;

      // Store credential ID (base64)
      const rawId = new Uint8Array((credential as any).rawId);
      const credentialId = btoa(String.fromCharCode(...rawId));
      await db.appSettings.update("singleton", {
        biometricCredentialId: credentialId,
        biometricEnabled: true,
      });
      return true;
    } catch (e) {
      console.warn("Biometric registration failed:", e);
      return false;
    }
  }
}

export const lockStore = new LockStore();
export { hashPin };
