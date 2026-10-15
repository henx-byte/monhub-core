
import { anilistExtension } from './anilist';
import { mangadexExtension } from './mangadex';
import { malExtension } from './myanimelist';

export const BUILTIN_EXTENSIONS = {
  anilist: anilistExtension,
  mangadex: mangadexExtension,
  myanimelist: malExtension,
};

export function getAllSupportedTypes(extensions) {
  const types = new Set();
  Object.values(extensions).forEach(ext => {
    if (ext.enabled) ext.supportedTypes.forEach(t => types.add(t));
  });
  return Array.from(types);
}
