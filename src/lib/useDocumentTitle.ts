import { useEffect } from 'react';
import { NEMO } from './nemo';

/** Sets the browser tab title: "Diary · Nemo's World", or just "Nemo's World" for null. */
export function useDocumentTitle(page: string | null) {
  useEffect(() => {
    const site = `${NEMO.name}'s World`;
    document.title = page ? `${page} · ${site}` : site;
  }, [page]);
}
