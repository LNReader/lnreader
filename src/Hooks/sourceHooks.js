import { useState, useEffect } from "react";
import { getSource } from "../sources/sources";

const usePopularNovels = (sourceId) => {
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPage] = useState(1);
    const [novels, setNovels] = useState([]);
    const [error, setError] = useState();

    const source = getSource(sourceId);

    useEffect(() => {
        const getNextPage = async (p) => {
            try {
                if (p === 1) setLoading(true);
                const res = await source.popularNovels(p);
                setHasMoreNovels(res.totalPages > pageNumber);
                setNovels((novels) => [...novels, ...data.novels]);
                setLoading(false);
            } catch (err) {
                setError(err.message);
            }
        };

        getNextPage(pageNumber);
    }, [pageNumber, sourceId]);

    const incrementPage = () => {
        setPage((pageNumber) => pageNumber + 1);
    };

    return { novels, incrementPage, loading, error };
};

export { usePopularNovels };
