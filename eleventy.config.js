// MEBO DESIGN STUDIO — static site build (GitHub Pages).
import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/uploads": "uploads", "src/.nojekyll": ".nojekyll" });

  // Collections ---------------------------------------------------------
  eleventyConfig.addCollection("projects", (api) =>
    api.getFilteredByGlob("src/projects/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || b.date - a.date));
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/journal/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date));

  // Filters -------------------------------------------------------------
  const pad = (n) => String(n).padStart(2, "0");
  eleventyConfig.addFilter("ym", (d) => { d = new Date(d); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}`; });
  eleventyConfig.addFilter("slugcat", (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, "-"));
  eleventyConfig.addFilter("readmin", (html) => {
    const text = String(html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, "");
    return Math.max(1, Math.ceil(text.length / 500));
  });
  eleventyConfig.addFilter("uniqueCats", (items) => {
    const seen = [];
    for (const it of items || []) { const c = it.data.category; if (c && !seen.includes(c)) seen.push(c); }
    return seen;
  });
  eleventyConfig.addFilter("orderedCats", (items, order) => {
    const used = new Set((items || []).map((i) => i.data.category).filter(Boolean));
    const out = (order || []).filter((c) => used.has(c));
    for (const c of used) if (!out.includes(c)) out.push(c);
    return out;
  });
  eleventyConfig.addFilter("split", (s, sep) => String(s || "").split(sep).map((x) => x.trim()).filter(Boolean));
  eleventyConfig.addFilter("neighbors", (items, url) => {
    const i = items.findIndex((p) => p.url === url);
    if (i < 0 || items.length < 2) return {};
    return { prev: items[(i - 1 + items.length) % items.length], next: items[(i + 1) % items.length] };
  });
  eleventyConfig.addFilter("related", (items, url, category, n = 3) => {
    const others = items.filter((p) => p.url !== url);
    const same = others.filter((p) => p.data.category === category);
    return [...same, ...others.filter((p) => !same.includes(p))].slice(0, n);
  });
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
