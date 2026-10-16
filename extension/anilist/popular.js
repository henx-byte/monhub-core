const gqlQuery = `query ($page: Int, $perPage: Int, $type: MediaType) { Page(page: $page, perPage: $perPage) { pageInfo { hasNextPage } media(type: $type, sort: TRENDING_DESC) { id title { romaji english } coverImage { extraLarge large color } bannerImage averageScore seasonYear startDate { year } description genres status chapters trailer { id site } } } }`;
const res = await fetch("https://graphql.anilist.co", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: gqlQuery,
    variables: { page, perPage: 5, type },
  }),
});
const j = await res.json();
if (j.errors) throw new Error(j.errors[0].message);
return {
  media: j.data?.Page?.media || [],
  hasNext: j.data?.Page?.pageInfo?.hasNextPage || false,
};
