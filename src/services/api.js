import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// In dev, use Vite proxy (/api -> staging server). In prod, use full URL.
const baseUrl = import.meta.env.DEV
  ? "/api"
  : `https://${import.meta.env.VITE_SUBDOMAIN}.${import.meta.env.VITE_GATEWAY_DOMAIN}${import.meta.env.VITE_MONOLITH_PATH}`;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // Try localStorage first (set via UI), then env variable
      const token =
        localStorage.getItem("mds_auth_token") ||
        import.meta.env.VITE_AUTH_TOKEN;
      if (token && token !== "your_x-app-token_here") {
        headers.set("Authorization", token);
      }
      return headers;
    },
  }),
  tagTypes: ["CommunityMembers", "Videos", "Categories", "Tags"],
  endpoints: () => ({}),
});
