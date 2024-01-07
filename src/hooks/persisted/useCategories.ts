import { useEffect, useState } from 'react';

import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import { Category } from '@database/types';

const useCategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>();

  const getCategories = async () => {
    try {
      const res = await getCategoriesFromDb();
      setCategories(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return {
    isLoading,
    categories,
    error,
  };
};

export default useCategories;
