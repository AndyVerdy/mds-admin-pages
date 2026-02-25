import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Token file path for persistent storage
const TOKEN_FILE = path.resolve(__dirname, ".auth-token");

// Read saved token if it exists
function readToken() {
  try {
    return fs.readFileSync(TOKEN_FILE, "utf-8").trim();
  } catch {
    return "";
  }
}

// Vite plugin that adds a /__save_token endpoint and injects auth into proxy
function authTokenPlugin() {
  let savedToken = readToken();

  return {
    name: "auth-token-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle token save endpoint (POST /__save_token)
        if (req.url === "/__save_token" && req.method === "POST") {
          // CORS headers so staging page can POST here
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");

          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
          }

          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            savedToken = body.trim();
            fs.writeFileSync(TOKEN_FILE, savedToken);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("Token saved (" + savedToken.length + " chars)");
            console.log(
              "\n✅ Auth token saved (" + savedToken.length + " chars)\n"
            );
          });
          return;
        }

        // Handle token check endpoint
        if (req.url === "/__save_token" && req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }

        // Handle token status check
        if (req.url === "/__token_status") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ hasToken: !!savedToken, length: savedToken.length }));
          return;
        }

        next();
      });
    },
    configureProxy(proxy) {
      // This doesn't exist, we'll use the proxy configure option instead
    },
  };
}

export default defineConfig({
  base: "/mds-admin-pages/",
  plugins: [react(), authTokenPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://pavel.groupos-staging.co",
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Inject saved auth token into all proxied requests
            const token = readToken();
            if (token) {
              proxyReq.setHeader("Authorization", token);
            }
          });
        },
      },
    },
  },
});
