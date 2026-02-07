"use client";

import { useEffect, useState } from "react";

type Props = {
  href: string;
};

const STORAGE_KEY = "trace-actor-name";
const EVENT_NAME = "trace-actor-name";

export default function DocumentVersionDownloadButton({ href }: Props) {
  const [downloadHref, setDownloadHref] = useState(href);

  useEffect(() => {
    const updateHref = () => {
      const actorName = localStorage.getItem(STORAGE_KEY) ?? "";
      if (actorName) {
        const url = new URL(href, window.location.origin);
        url.searchParams.set("actorName", actorName);
        setDownloadHref(url.toString());
      } else {
        setDownloadHref(href);
      }
    };
    updateHref();
    window.addEventListener(EVENT_NAME, updateHref);
    return () => window.removeEventListener(EVENT_NAME, updateHref);
  }, [href]);

  return (
    <a className="text-xs font-semibold text-accent" href={downloadHref}>
      Download
    </a>
  );
}
