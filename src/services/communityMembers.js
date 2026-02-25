import { api } from "./api";

export const communityMembersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityMembers: builder.query({
      query: ({ page = 1, limit = 20, search = "", membership = "nonsubscribe" }) => ({
        url: "/v1/users/community-members-list",
        params: { page, limit, search, membership, expand: true },
      }),
      providesTags: ["CommunityMembers"],
    }),
    getCommunityMembersSuggestions: builder.query({
      query: () => ({
        url: "/v1/users/community-members-suggestions",
        params: { expand: true },
      }),
    }),
    deleteLeadUser: builder.mutation({
      query: (body) => ({
        url: "/v1/user-migrations/delete-lead-user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CommunityMembers"],
    }),
    exportCommunityMembers: builder.mutation({
      query: (body) => ({
        url: "/v1/users/common-user-export",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetCommunityMembersQuery,
  useGetCommunityMembersSuggestionsQuery,
  useDeleteLeadUserMutation,
  useExportCommunityMembersMutation,
} = communityMembersApi;
