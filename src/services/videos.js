import { api } from "./api";

export const videosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query({
      query: ({ page = 1, limit = 50, search = "", category = "", tag = "", status = "" }) => ({
        url: "/content-archive/videos",
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(category && { category }),
          ...(tag && { tag }),
          ...(status && { status }),
        },
      }),
      providesTags: ["Videos"],
    }),
    getCategories: builder.query({
      query: () => "/AS/categories",
      providesTags: ["Categories"],
    }),
    getTags: builder.query({
      query: () => "/tagList",
      providesTags: ["Tags"],
    }),
    getVideoSuggestions: builder.query({
      query: () => "/content-archive/getContentVideoSuggestionList",
    }),
  }),
});

export const {
  useGetVideosQuery,
  useLazyGetVideosQuery,
  useGetCategoriesQuery,
  useGetTagsQuery,
  useGetVideoSuggestionsQuery,
} = videosApi;
