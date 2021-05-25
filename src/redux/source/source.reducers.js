import { GET_SOURCES, SEARCH_SOURCES, PIN_SOURCES } from "./source.types";

const initialState = {
    sources: [],
    pinnedSources: [],
    search: [],
    pinned: [],
    loading: true,
};

const sourceReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_SOURCES:
            return { ...state, sources: payload, loading: false };
        case PIN_SOURCES:
            return {
                ...state,
                pinned:
                    state.pinned.indexOf(payload) === -1
                        ? [...state.pinned, payload]
                        : state.pinned.filter((source) => source !== payload),
                loading: false,
            };
        case SEARCH_SOURCES:
            return {
                ...state,
                search: state.sources.filter((source) =>
                    source.sourceName.toLowerCase().includes(payload)
                ),
            };
        default:
            return state;
    }
};

export default sourceReducer;
