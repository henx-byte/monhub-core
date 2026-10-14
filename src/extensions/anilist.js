
// Monhub Official Extension - AniList (LEGAL)
// This is the template for official repo
const extension = {
  id: 'anilist',
  name: 'AniList',
  version: '0.1.0',
  isOfficial: true,
  baseUrl: 'https://graphql.anilist.co',
  
  async search(query) {
    const gql = `
      query ($search: String) {
        Page(perPage: 10) {
          media(search: $search, type: ANIME) {
            id title { romaji english } coverImage { large } seasonYear averageScore
          }
        }
      }
    `;
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql, variables: { search: query } })
    });
    const json = await res.json();
    return json.data.Page.media.map(m => ({
      id: m.id,
      title: m.title.english || m.title.romaji,
      poster: m.coverImage.large,
      year: m.seasonYear,
      score: m.averageScore
    }));
  },

  async getDetail(id) {
    // simplified
    return { id, synopsis: 'From AniList API - legal metadata only. Watch via official apps.' };
  },

  async getWatchUrl(id) {
    // LEGAL MODE: returns deep links, not mp4
    return {
      type: 'deeplink',
      links: [
        { name: 'Bstation', url: `https://www.bilibili.tv/en/search-result?q=${id}` },
        { name: 'Crunchyroll', url: `https://www.crunchyroll.com/search?q=${id}` }
      ]
    };
  }
};

export default extension;
