export default {
  layout: "layouts/post.njk",
  view: "post",
  eleventyComputed: {
    permalink: (d) => (d.draft ? false : `/journal/${d.page.fileSlug}/`),
  },
};
