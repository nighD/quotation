import { useEffect } from "react";

export interface PageMetadata {
  title?: string;
  description?: string;
  favicon?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
}

export const DEFAULT_PAGE_METADATA: PageMetadata = {
  title: "On-Chain Card — Your Decentralized Membership Card",
  description:
    "On-Chain Card is a decentralized membership card that verifies your identity and unlocks on-chain perks — transparent, secure, wallet-connected, and owned by you with no middlemen.",
  favicon: "/admin/icon/favicon.ico",
  ogTitle: "On-Chain Card — Your Decentralized Membership Card",
  ogDescription:
    "On-Chain Card is a decentralized membership card that verifies your identity and unlocks on-chain perks — transparent, secure, wallet-connected, and owned by you with no middlemen.",
  ogImage: "/admin/card-vifc-pass-default.png",
  twitterTitle: "On-Chain Card — Your Decentralized Membership Card",
  twitterDescription:
    "On-Chain Card is a decentralized membership card that verifies your identity and unlocks on-chain perks — transparent, secure, wallet-connected, and owned by you with no middlemen.",
  twitterImage: "/admin/card-vifc-pass-default.png",
  twitterCard: "summary_large_image",
};

export const ADMIN_DEFAULT_METADATA: PageMetadata = {
  title: "On-Chain Card — Your Decentralized Membership Card",
  description:
    "On-Chain Card is a decentralized membership card that verifies your identity and unlocks on-chain perks — transparent, secure, wallet-connected, and owned by you with no middlemen.",
  favicon: "/admin/icon/favicon.ico",
  ogTitle: "On-Chain Card — Your Decentralized Membership Card",
  ogDescription:
    "On-Chain Card is a decentralized membership card that verifies your identity and unlocks on-chain perks — transparent, secure, wallet-connected, and owned by you with no middlemen.",
  ogImage: "/admin/card-vifc-pass-default.png",
  twitterTitle: "On-Chain Card — Your Decentralized Membership Card",
  twitterDescription:
    "On-Chain Card is a decentralized membership card that verifies your identity and unlocks on-chain perks — transparent, secure, wallet-connected, and owned by you with no middlemen.",
  twitterImage: "/admin/card-vifc-pass-default.png",
  twitterCard: "summary_large_image",
};

function updateMetaTag(nameOrProperty: "name" | "property", key: string, content?: string) {
  if (!content) return;
  let tag = document.querySelector(`meta[${nameOrProperty}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(nameOrProperty, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function updateFavicon(iconUrl?: string) {
  if (!iconUrl) return;
  let favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  if (iconUrl.endsWith(".svg")) {
    favicon.type = "image/svg+xml";
  } else if (iconUrl.endsWith(".png")) {
    favicon.type = "image/png";
  } else if (iconUrl.endsWith(".ico")) {
    favicon.type = "image/x-icon";
  }
  favicon.href = iconUrl;
}

export function applyMetadata(metadata: PageMetadata) {
  if (typeof document === "undefined") return;

  if (metadata.title) {
    document.title = metadata.title;
  }
  if (metadata.description) {
    updateMetaTag("name", "description", metadata.description);
  }
  if (metadata.favicon) {
    updateFavicon(metadata.favicon);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const resolveUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const ogTitle = metadata.ogTitle || metadata.title;
  const ogDescription = metadata.ogDescription || metadata.description;
  const ogImage = resolveUrl(metadata.ogImage);

  updateMetaTag("property", "og:title", ogTitle);
  updateMetaTag("property", "og:description", ogDescription);
  if (ogImage) updateMetaTag("property", "og:image", ogImage);
  updateMetaTag("property", "og:url", metadata.ogUrl || (typeof window !== "undefined" ? window.location.href : ""));
  updateMetaTag("property", "og:type", metadata.ogType || "website");

  const twitterTitle = metadata.twitterTitle || ogTitle;
  const twitterDescription = metadata.twitterDescription || ogDescription;
  const twitterImage = resolveUrl(metadata.twitterImage || metadata.ogImage);

  updateMetaTag("name", "twitter:title", twitterTitle);
  updateMetaTag("name", "twitter:description", twitterDescription);
  if (twitterImage) updateMetaTag("name", "twitter:image", twitterImage);
  updateMetaTag("name", "twitter:card", metadata.twitterCard || "summary_large_image");
}

export function usePageMetadata(metadata: PageMetadata, restoreOnUnmount = true) {
  useEffect(() => {
    applyMetadata(metadata);

    return () => {
      if (restoreOnUnmount) {
        applyMetadata(DEFAULT_PAGE_METADATA);
      }
    };
  }, [
    metadata.title,
    metadata.description,
    metadata.favicon,
    metadata.ogTitle,
    metadata.ogDescription,
    metadata.ogImage,
    metadata.ogUrl,
    metadata.ogType,
    metadata.twitterTitle,
    metadata.twitterDescription,
    metadata.twitterImage,
    metadata.twitterCard,
    restoreOnUnmount,
  ]);
}
