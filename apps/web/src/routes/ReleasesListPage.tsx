import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { CreateReleaseDialog, type CreateReleaseDialogHandle } from "../components/releases/CreateReleaseDialog";
import { placeholderReleases, type ReleaseListItem } from "../lib/placeholderData";
import { formatReleaseDate } from "../lib/format";

type StatusFilter = "all" | "draft" | "submitted";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
];

function ReadinessCell({ summary }: { summary: ReleaseListItem["readinessSummary"] }) {
  if (!summary) {
    return <span className="text-[0.88rem]/[normal] text-text-soft">—</span>;
  }
  if (summary.checksPassed === summary.checksTotal) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.88rem]/[normal] font-semibold text-good">
        <span className="h-2 w-2 rounded-full bg-good" aria-hidden="true" />
        Ready to submit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.88rem]/[normal] font-semibold text-critical">
      <span className="h-2 w-2 rounded-full bg-critical" aria-hidden="true" />
      {summary.checksPassed} / {summary.checksTotal} checks
    </span>
  );
}

export function ReleasesListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const dialogHandleRef = useRef<CreateReleaseDialogHandle>(null);

  const visibleReleases =
    statusFilter === "all"
      ? placeholderReleases
      : placeholderReleases.filter((release) => release.status === statusFilter);

  return (
    <>
      <div className="mb-5.5 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-text">Releases</h1>
          <p className="text-sm text-text-soft">
            Every release in the catalogue, with its readiness for submission.
          </p>
        </div>
        <Button onClick={() => dialogHandleRef.current?.open()}>+ New Release</Button>
      </div>

      <div className="mb-4.5 flex items-center gap-2.5">
        <span className="text-[0.75rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Status</span>
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex gap-0.5 rounded-full border border-border p-0.75"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className="rounded-full px-3.5 py-1.5 text-[0.92rem]/[normal] font-semibold text-text-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:bg-accent aria-pressed:text-accent-contrast"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Title</th>
              <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Artist</th>
              <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Release date</th>
              <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Status</th>
              <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {visibleReleases.map((release) => (
              <tr key={release.id} className="border-b border-border last:border-b-0 hover:bg-accent/5">
                <td className="px-5 py-3.5">
                  <Link
                    to={`/releases/${release.id}`}
                    className="text-sm font-bold text-text hover:text-accent hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {release.title ?? <span className="font-normal italic text-text-soft">(untitled)</span>}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-text-soft">{release.artist_name}</td>
                <td className="px-5 py-3.5 text-[0.88rem]/[normal] text-text-soft">{formatReleaseDate(release.release_date)}</td>
                <td className="px-5 py-3.5">
                  <Pill>{release.status === "draft" ? "Draft" : "Submitted"}</Pill>
                </td>
                <td className="px-5 py-3.5">
                  <ReadinessCell summary={release.readinessSummary} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <CreateReleaseDialog ref={dialogHandleRef} />
    </>
  );
}
