// src/hooks/library/useCategories.ts
import { useCallback, useEffect, useState } from 'react';
import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import { Category } from '@database/types';

export type ExtendedCategory = Category & { novelIds: number[] };

export const useFetchCategories = () => {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const dbCategories = await getCategoriesFromDb();
      const res = dbCategories.map(c => ({
        ...c,
        novelIds: (c.novelIds ?? '').split(',').map(Number).filter(Boolean),
      }));
      setCategories(res);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    categoriesLoading,
    refreshCategories: fetchCategories,
    setCategories,
  };
};
