export default {
  layout: "layouts/project.njk",
  view: "project",
  eleventyComputed: {
    permalink: (d) => (d.draft ? false : `/projects/${d.page.fileSlug}/`),
  },
};
