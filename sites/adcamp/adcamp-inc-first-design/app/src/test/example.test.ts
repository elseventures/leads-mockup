import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import App from "@/App";

describe("Adcamp mockup", () => {
  it("renders the home-page value proposition and contact route", async () => {
    vi.stubGlobal("scrollTo", vi.fn());
    render(React.createElement(App));

    expect(screen.getByText(/Mississippi Paving/i)).toBeInTheDocument();
    expect(screen.getByText(/Done Right Since 1989/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact us now/i })).toHaveAttribute("href", "/contact");
  });
});
