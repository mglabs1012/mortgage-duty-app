import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
};

const SITE_URL = "https://mortgage-duty-app.vercel.app";

export function useDocumentMeta({ title, description, path, type = "website" }: DocumentMeta) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    const url = `${SITE_URL}${path}`;
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:url"]', "content", url);

    // Reset og:type back to "website" when this route unmounts (e.g. an
    // article page navigated away from), so it doesn't leak into other routes.
    return () => {
      setMeta('meta[property="og:type"]', "content", "website");
    };
  }, [title, description, path, type]);
}
