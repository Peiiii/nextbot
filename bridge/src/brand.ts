export const ENV_APP_NAME_KEY = "NEXTCLAW_APP_NAME";
export const ENV_HOME_KEY = "NEXTCLAW_HOME";
export const DEFAULT_HOME_DIR = ".nextclaw";

const envAppName = process.env[ENV_APP_NAME_KEY]?.trim();
export const APP_NAME = envAppName && envAppName.length > 0 ? envAppName : "nextclaw";
export const APP_TITLE = `${APP_NAME.slice(0, 1).toUpperCase()}${APP_NAME.slice(1)}`;
