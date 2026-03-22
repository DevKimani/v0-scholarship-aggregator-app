'use client';

import { useEffect, useState } from 'react';
import { fetchSheetData, SAMPLE_DATA, type SheetData } from './sheets';

export function useSheetData() {
  const [data, setData] = useState<SheetData>(SAMPLE_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check sessionStorage for cached data (valid for 10 minutes)
    const cacheKey = 'sheet_data_cache';
    const cacheTimestampKey = 'sheet_data_cache_timestamp';
    const cached = sessionStorage.getItem(cacheKey);
    const cacheTimestamp = sessionStorage.getItem(cacheTimestampKey);
    const now = Date.now();
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    if (cached && cacheTimestamp && now - parseInt(cacheTimestamp) < CACHE_DURATION) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // Fetch fresh data
    fetchSheetData()
      .then((freshData) => {
        setData(freshData);
        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
        sessionStorage.setItem(cacheTimestampKey, now.toString());
      })
      .catch((err) => {
        setError(err?.message || 'Failed to fetch scholarship data');
        setData(SAMPLE_DATA);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
