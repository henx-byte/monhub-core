import { GLOBAL_XPATH } from "../helpers/xpath";

export function createExtensionFromConfig(config) {
  const {
    id,
    name,
    supportedTypes,
    popularCode,
    searchCode,
    detailCode,
    streamCode,
  } = config;
  const errors = [];
  if (!id) errors.push("id");
  if (!name) errors.push("name");
  if (
    !supportedTypes ||
    !Array.isArray(supportedTypes) ||
    supportedTypes.length === 0
  )
    errors.push("supportedTypes");
  if (!popularCode) errors.push("popularCode");
  if (!searchCode) errors.push("searchCode");
  if (errors.length > 0) {
    console.log(`[CREATE FAIL] ${id || "unknown"}: ${errors.join(", ")}`);
    return {
      id: id || `fail_${Date.now()}`,
      name: name || "Invalid",
      supportedTypes: supportedTypes || [],
      enabled: false,
      _source: config.source,
      _popularCode: popularCode,
      _searchCode: searchCode,
      _detailCode: detailCode,
      _streamCode: streamCode,
      get: {
        popular: async () => ({
          media: [],
          hasNext: false,
          error: errors.join(", "),
        }),
        search: async () => [],
        detail: async () => null,
        stream: async () => null,
      },
    };
  }
  const exec = async (codeName, code, args, values) => {
    if (!code) return { error: `${codeName} missing` };
    try {
      const fn = new Function(
        ...args,
        "$x",
        "console",
        `return (async () => { ${code} })()`,
      );
      return await fn(...values, GLOBAL_XPATH, console);
    } catch (e) {
      console.log(`[ERR] ${codeName} ${id}: ${e.message}`);
      return { error: `${codeName}: ${e.message}` };
    }
  };
  return {
    id,
    name,
    supportedTypes,
    enabled: config.enabled !== false,
    version: config.version || "1.0.0",
    _source: config.source || { type: "manual" },
    _popularCode: popularCode,
    _searchCode: searchCode,
    _detailCode: detailCode,
    _streamCode: streamCode,
    get: {
      popular: async (type, page = 1) => {
        const res = await exec(
          "popularCode",
          popularCode,
          ["type", "page", "fetch"],
          [type, page, fetch],
        );
        if (res && res.error) return res;
        if (!res) return { media: [], hasNext: false };
        if (Array.isArray(res)) return { media: res, hasNext: false };
        return res;
      },
      search: async (type, query) => {
        const res = await exec(
          "searchCode",
          searchCode,
          ["type", "query", "fetch"],
          [type, query, fetch],
        );
        if (!res || res.error) return [];
        if (Array.isArray(res)) return res;
        if (res.media) return res.media;
        return [];
      },
      detail: async (itemId, type) => {
        if (!detailCode) return null;
        const res = await exec(
          "detailCode",
          detailCode,
          ["id", "type", "fetch"],
          [itemId, type, fetch],
        );
        if (res && res.error) return null;
        return res;
      },
      stream: async (itemId, type) => {
        if (!streamCode) return null;
        const res = await exec(
          "streamCode",
          streamCode,
          ["id", "type", "fetch"],
          [itemId, type, fetch],
        );
        if (res && res.error) return { error: res.error };
        return res;
      },
    },
  };
}
