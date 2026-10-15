
export const mangadexExtension = {
  id: 'mangadex',
  name: 'MangaDex',
  supportedTypes: ['MANGA', 'MANHWA', 'MANHUA'],
  version: '1.0.0',
  enabled: true,
  get: {
    popular: async (type, page=1) => {
      try {
        const query = `query ($page: Int, $perPage: Int) { Page(page: $page, perPage: $perPage) { pageInfo { hasNextPage } media(type: MANGA, sort: POPULARITY_DESC) { id title { romaji english } coverImage { extraLarge large color } bannerImage averageScore startDate { year } description genres status chapters } } }`;
        const res = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables: { page, perPage: 12 } }) });
        const j = await res.json();
        return { media: j.data?.Page?.media || [], hasNext: j.data?.Page?.pageInfo?.hasNextPage || false };
      } catch(e) { return { media: [], hasNext: false }; }
    },
    search: async (type, queryStr) => {
      try {
        const res = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(queryStr)}&limit=12&contentRating[]=safe&order[followedCount]=desc&includes[]=cover_art`);
        const j = await res.json();
        return (j.data || []).map(m => {
          const title = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown';
          const coverRel = m.relationships.find(r => r.type === 'cover_art');
          const coverFile = coverRel?.attributes?.fileName;
          return {
            id: m.id,
            title: { romaji: title, english: title },
            coverImage: { extraLarge: coverFile ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.512.jpg` : '', large: '', color: '#000' },
            bannerImage: null, averageScore: 80, startDate: { year: m.attributes.year }, description: m.attributes.description.en?.slice(0,200) || '', genres: ['Manga'], status: m.attributes.status, chapters: null,
          };
        });
      } catch(e) { return []; }
    },
  }
};
