import { create } from "zustand";
import {
  ACTIVATION_STORAGE_KEY,
  type ActivationRecord,
  validateActivationCode,
} from "../lib/activation";

type ActivationState = {
  status: "idle" | "activating" | "active";
  activation: ActivationRecord | null;
  error: string | null;
  hydrate: () => void;
  activate: (code: string) => Promise<boolean>;
  clearActivation: () => void;
};

function readStoredActivation(): ActivationRecord | null {
  try {
    const raw = window.localStorage.getItem(ACTIVATION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as ActivationRecord;
  } catch {
    return null;
  }
}

function writeStoredActivation(activation: ActivationRecord | null) {
  if (!activation) {
    window.localStorage.removeItem(ACTIVATION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    ACTIVATION_STORAGE_KEY,
    JSON.stringify(activation),
  );
}

export const useActivationStore = create<ActivationState>((set) => ({
  status: "idle",
  activation: null,
  error: null,
  hydrate: () => {
    const activation = readStoredActivation();
    set({
      activation,
      status: activation ? "active" : "idle",
      error: null,
    });
  },
  activate: async (code) => {
    set({ status: "activating", error: null });

    try {
      const result = await validateActivationCode(code);
      const activation: ActivationRecord = {
        token: result.token,
        codeHash: result.codeHash,
        activatedAt: new Date().toISOString(),
      };

      writeStoredActivation(activation);
      set({ activation, status: "active", error: null });
      return true;
    } catch (error) {
      set({
        status: "idle",
        error:
          error instanceof Error
            ? error.message
            : "Activation failed. Please try again.",
      });
      return false;
    }
  },
  clearActivation: () => {
    writeStoredActivation(null);
    set({ activation: null, status: "idle", error: null });
  },
}));
