export const ACTIVATION_STORAGE_KEY = "resell.activation";

export type ActivationRecord = {
  codeHash: string;
  activatedAt: string;
  token: string;
};

export type ActivationResult = {
  token: string;
  codeHash: string;
};

const VALID_CODES = new Set([
  "RSLR-2026-START",
  "RSLR-DEMO-0001",
  "RSLR-ETSY-TEST",
]);

export function normalizeActivationCode(input: string) {
  return input.trim().toUpperCase();
}

export function isActivationCodeFormatValid(input: string) {
  return /^RSLR-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}$/.test(normalizeActivationCode(input));
}

export async function validateActivationCode(
  input: string,
): Promise<ActivationResult> {
  const code = normalizeActivationCode(input);

  await new Promise((resolve) => window.setTimeout(resolve, 450));

  if (!isActivationCodeFormatValid(code)) {
    throw new Error("Enter a valid activation code.");
  }

  if (!VALID_CODES.has(code)) {
    throw new Error("This activation code was not recognised.");
  }

  return {
    token: `demo.${btoa(code)}.${Date.now()}`,
    codeHash: hashCode(code),
  };
}

function hashCode(code: string) {
  let hash = 0;
  for (let index = 0; index < code.length; index += 1) {
    hash = (hash << 5) - hash + code.charCodeAt(index);
    hash |= 0;
  }
  return `local-${Math.abs(hash)}`;
}
