import type { Contributor, Release, TrackCredit } from "@release-ready/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContributorSplitEditor } from "./ContributorSplitEditor";

const contributors: Contributor[] = [
  {
    id: 1,
    name: "Nova Sinclair",
    default_role: "composer",
    created_at: new Date("2026-01-01"),
  },
];

const release: Release = {
  id: 1,
  title: "Test Release",
  artist_name: "Test Artist",
  upc: "123456789012",
  release_date: new Date("2026-01-01"),
  status: "draft",
  created_at: new Date("2026-01-01"),
  updated_at: new Date("2026-01-01"),
};

const rows: TrackCredit[] = [
  {
    contributor_id: 1,
    name: "Nova Sinclair",
    role: "composer",
    split_percent: 40,
  },
];

describe("ContributorSplitEditor", () => {
  it("starts with the live total from the starter rows", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ContributorSplitEditor
          rows={rows}
          release={release}
          contributors={contributors}
          releaseId="1"
          trackId="1"
        />
      </QueryClientProvider>,
    );

    const totalDisplay = screen.getByText(/40%/);
    expect(totalDisplay).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: "Save splits" });
    expect(saveButton).toBeDisabled();

    const splitInput = screen.getByLabelText("Split percent for Nova Sinclair");
    fireEvent.change(splitInput, { target: { value: "100" } });
    const updatedTotal = screen.getByText(/^100%$/);
    expect(updatedTotal).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });
});
