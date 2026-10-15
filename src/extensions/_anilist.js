
// Extension: anilist - Separate file
// Interface: get.popular(type, page), get.search(type, query), get.detail, get.stream

export const anilistExtension = {
  id: 'anilist',
  name: 'AniList',
  supportedTypes: ['ANIME', 'MANGA'],
  version: '1.0.0',
  enabled: true,
  get: {
    popular: async (type, page=1) => {
      const query = `
        query ($page: Int, $perPage: Int, $type: MediaType) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { hasNextPage }
            media(type: $type, sort: TRENDING_DESC) {
              id title { romaji english } coverImage { extraLarge large color } bannerImage averageScore seasonYear startDate { year } description genres status chapters trailer { id site }
            }
          }
        }
      `;
      try {
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { page, perPage: 12, type } })
        });
        const j = await res.json();
        if (j.errors) return { media: [], hasNext: false, error: j.errors[0].message };
        return { media: j.data?.Page?.media || [], hasNext: j.data?.Page?.pageInfo?.hasNextPage || false };
      } catch(e) { return { media: [], hasNext: false, error: e.message }; }
    },
    search: async (type, queryStr) => {
      const q = `query ($search: String, $type: MediaType) { Page(page: 1, perPage: 18) { media(type: $type, search: $search) { id title { romaji english } coverImage { extraLarge large color } bannerImage averageScore seasonYear startDate { year } description genres status chapters trailer { id site } } } }`;
      try {
        const res = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, variables: { search: queryStr, type } }) });
        const j = await res.json();
        return j.data?.Page?.media || [];
      } catch(e) { return []; }
    },
    categories: async () => ['Action', 'Adventure', 'Comedy'],
    detail: async (id, type) => null,
    stream: async (id, type) => null,
  }
};
