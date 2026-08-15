"use client";

import { useEffect, useState } from "react";

import { deleteProgressEntry, getProgressEntries, saveProgressEntry } from "../repositories/progress-repository";
import type { ProgressEntry } from "../types/progress-entry";

export function useProgressEntries() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getProgressEntries()
      .then((storedEntries) => { if (isCurrent) setEntries(storedEntries); })
      .finally(() => { if (isCurrent) setIsHydrated(true); });
    return () => { isCurrent = false; };
  }, []);

  async function addEntry(entry: ProgressEntry) {
    await saveProgressEntry(entry);
    setEntries((currentEntries) => [entry, ...currentEntries].sort((entryA, entryB) => entryB.date.localeCompare(entryA.date)));
  }

  async function removeEntry(id: string) {
    await deleteProgressEntry(id);
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id));
  }

  return { entries, isHydrated, addEntry, removeEntry };
}
