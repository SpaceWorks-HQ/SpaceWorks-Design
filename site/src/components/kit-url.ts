// Public URL of a synced kit file, under the site's base path (e.g. /SpaceWorks-Design/kit/logo/symbol.svg).
export const kitUrl = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/kit/${path}`;
