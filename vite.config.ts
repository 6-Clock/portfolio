import { defineConfig, type Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

// SparkJS loads its WASM sorter in a worker and benefits from cross-origin
// isolation, so the app is served with COOP/COEP. But COEP: require-corp blocks
// Chrome's built-in PDF viewer, so the resume tab would open blank. Skip the
// isolation headers on PDF responses; everything else stays isolated. This keeps
// the dev server in step with the path-scoped headers declared in vercel.json.
function crossOriginIsolation(): Plugin {
  const apply = (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ): void => {
    if (!req.url?.split("?")[0].endsWith(".pdf")) {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    }
    next();
  };
  return {
    name: "cross-origin-isolation",
    configureServer(server) {
      server.middlewares.use(apply);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apply);
    },
  };
}

export default defineConfig({
  plugins: [crossOriginIsolation()],
});
