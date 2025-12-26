"use client";

import { MediaItem } from "@/types/tmdb";

const WATCH_LIST_KEY = "tmdb-watch-list";

export interface WatchListItem extends MediaItem {
  addedAt: number; // Timestamp when item was added
}

/**
 * Get all items from the watch list
 */
export function getWatchList(): WatchListItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(WATCH_LIST_KEY);
    if (!stored) return [];
    const items: WatchListItem[] = JSON.parse(stored);
    // Sort by most recently added first
    return items.sort((a, b) => b.addedAt - a.addedAt);
  } catch (error) {
    console.error("Error reading watch list:", error);
    return [];
  }
}

/**
 * Add an item to the watch list
 */
export function addToWatchList(item: MediaItem): void {
  if (typeof window === "undefined") return;
  
  try {
    const currentList = getWatchList();
    const itemId = String(item.id);
    
    // Check if item already exists
    const exists = currentList.some((i) => String(i.id) === itemId);
    if (exists) {
      // Remove existing item to re-add it at the top (most recent)
      const filtered = currentList.filter((i) => String(i.id) !== itemId);
      const newItem: WatchListItem = {
        ...item,
        addedAt: Date.now(),
      };
      localStorage.setItem(WATCH_LIST_KEY, JSON.stringify([newItem, ...filtered]));
    } else {
      // Add new item
      const newItem: WatchListItem = {
        ...item,
        addedAt: Date.now(),
      };
      localStorage.setItem(WATCH_LIST_KEY, JSON.stringify([newItem, ...currentList]));
    }
  } catch (error) {
    console.error("Error adding to watch list:", error);
  }
}

/**
 * Remove an item from the watch list
 */
export function removeFromWatchList(itemId: string | number): void {
  if (typeof window === "undefined") return;
  
  try {
    const currentList = getWatchList();
    const filtered = currentList.filter((i) => String(i.id) !== String(itemId));
    localStorage.setItem(WATCH_LIST_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from watch list:", error);
  }
}

/**
 * Check if an item is in the watch list
 */
export function isInWatchList(itemId: string | number): boolean {
  if (typeof window === "undefined") return false;
  
  const currentList = getWatchList();
  return currentList.some((i) => String(i.id) === String(itemId));
}

