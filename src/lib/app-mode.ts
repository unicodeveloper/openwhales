const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE || "self-hosted";

export function isSelfHostedMode(): boolean {
  return APP_MODE === "self-hosted";
}

export function isValyuMode(): boolean {
  return APP_MODE === "valyu";
}
