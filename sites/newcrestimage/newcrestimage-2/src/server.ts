import handler from "@tanstack/react-start/server-entry";
import { renderErrorPage } from "./lib/error-page";

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function withSecurityHeaders(response: Response): Response {
  const secured = new Response(response.body, response);
  secured.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  secured.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  secured.headers.set("x-content-type-options", "nosniff");
  secured.headers.set("x-frame-options", "SAMEORIGIN");
  return secured;
}

export default {
  async fetch(request): Promise<Response> {
    try {
      const response = await handler.fetch(request);
      return withSecurityHeaders(response);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "Unhandled SSR error",
          error: error instanceof Error ? error.message : String(error),
          path: new URL(request.url).pathname,
        }),
      );
      return withSecurityHeaders(brandedErrorResponse());
    }
  },
} satisfies ExportedHandler<Env>;
