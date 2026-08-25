import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pill } from "../components/ui/Pill";
import { ReadinessPanel } from "../components/release-detail/ReadinessPanel";
import {
  AddTrackDialog,
  type AddTrackDialogHandle,
} from "../components/release-detail/AddTrackDialog";
import { formatReleaseDate } from "../lib/format";
import { useQuery } from "@tanstack/react-query";
import { fetchReleaseById, fetchTracksByRelease } from "../lib/api";
import { ReleaseDetailSkeleton } from "../components/skeletons/ReleaseDetailSkeleton";
import { ErrorState } from "../components/errors/ErrorState";
import { CompactErrorState } from "../components/errors/CompactErrorState";

export function ReleaseDetailPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const addTrackDialogRef = useRef<AddTrackDialogHandle>(null);

  const {
    data: release,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["release", releaseId],
    queryFn: () => fetchReleaseById(releaseId),
  });

  const {
    data: tracks,
    isError: isTracksError,
    error: tracksError,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ["tracks", releaseId],
    queryFn: () => fetchTracksByRelease(releaseId),
  });

  if (isError) {
    return (
      <>
        <Link
          to="/dashboard"
          className="mb-5.5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-soft hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Releases
        </Link>
        <ErrorState
          title="Couldn't load this release"
          message={error instanceof Error ? error.message : "Unknown error"}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Link
          to="/dashboard"
          className="mb-5.5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-soft hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Releases
        </Link>
        <ReleaseDetailSkeleton />
      </>
    );
  }

  if (!release) {
    return (
      <div>
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-text-soft hover:text-accent"
        >
          ← Releases
        </Link>
        <p className="mt-4 text-base text-text-soft">Release not found.</p>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/dashboard"
        className="mb-5.5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-soft hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ← Releases
      </Link>

      <div className="mb-8">
        {release?.title ? (
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-text">
            {release.title}
          </h1>
        ) : (
          <h1 className="mb-1 text-2xl font-normal italic text-text-soft">
            (untitled)
          </h1>
        )}
        <p className="mb-3.5 text-[1.1rem]/[normal] text-text-soft">
          {release?.artist_name}
        </p>
        <div className="flex flex-wrap items-center gap-3.5">
          <Pill>{release?.status === "draft" ? "Draft" : "Submitted"}</Pill>
          <span className="text-border">·</span>
          <span className="text-sm text-text-soft">
            Release date:{" "}
            <strong className="font-semibold text-text">
              {formatReleaseDate(release?.release_date)}
            </strong>
          </span>
          <span className="text-border">·</span>
          {release?.upc ? (
            <span className="text-sm text-text-soft">
              UPC:{" "}
              <strong className="font-semibold text-text">{release.upc}</strong>
            </span>
          ) : (
            <span className="text-sm italic text-critical">UPC not set</span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-6">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2.5 flex min-h-6.75 items-center justify-between gap-3">
            <p className="text-[0.75rem]/[normal] font-bold uppercase tracking-wide text-text-soft">
              Tracks
            </p>
            {release.status !== "submitted" && (
              <button
                type="button"
                disabled={!tracks}
                onClick={() => addTrackDialogRef.current?.open()}
                className="rounded-sm border border-border px-3 py-1.25 text-[0.8rem]/[normal] font-semibold text-text hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                + Add track
              </button>
            )}
          </div>
          <Card className="flex h-71.5 flex-col">
            {isTracksError ? (
              <CompactErrorState
                title="Couldn't load tracks"
                message={
                  tracksError instanceof Error
                    ? tracksError.message
                    : "Unknown error"
                }
                onRetry={() => refetchTracks()}
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="sticky top-0 bg-bg px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-bg px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-bg px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft"
                      >
                        ISRC
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 bg-bg px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft"
                      >
                        Splits
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks?.map((track) => (
                      <tr key={track.id} className="border-b border-border">
                        <td className="px-5 py-3.5 text-sm text-text-soft">
                          {track.track_number}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-bold text-text">
                          <Link
                            to={`/releases/${release.id}/tracks/${track.id}`}
                            className="hover:text-accent hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            {track.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[0.85rem]/[normal] text-text-soft">
                          {track.isrc ?? (
                            <span className="font-sans italic text-critical">
                              Missing
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-5 py-3.5 text-sm font-semibold ${track.splitsTotal === 100 ? "text-good" : "text-critical"}`}
                        >
                          {track.splitsTotal === 0
                            ? "No contributors"
                            : `${track.splitsTotal}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2.5 flex min-h-6.75 items-center">
            <p className="text-[0.75rem]/[normal] font-bold uppercase tracking-wide text-text-soft">
              Readiness
            </p>
          </div>
          <Card className="flex h-71.5 flex-col">
            <ReadinessPanel checks={release.readinessSummary.ruleChecks} />
          </Card>
        </section>
      </div>

      <Card className="mt-7 flex items-center justify-between gap-4 px-5.5 py-4.5">
        <span
          className={`inline-flex items-center gap-2 text-[0.95rem]/[normal] font-semibold ${release.readinessSummary.checksPassed === release.readinessSummary.checksTotal ? "text-good" : "text-critical"}`}
        >
          <span
            className={`h-2.25 w-2.25 rounded-full ${release.readinessSummary.checksPassed === release.readinessSummary.checksTotal ? "bg-good" : "bg-critical"}`}
            aria-hidden="true"
          />
          {release.readinessSummary.checksPassed} /{" "}
          {release.readinessSummary.checksTotal} checks passing
        </span>
        {release?.status === "submitted" ? (
          <span className="text-sm font-semibold text-text-soft">
            Already submitted
          </span>
        ) : (
          <Button
            disabled={
              release.readinessSummary.checksPassed <
              release.readinessSummary.checksTotal
            }
          >
            Submit release
          </Button>
        )}
      </Card>
      {tracks && releaseId && (
        <AddTrackDialog
          ref={addTrackDialogRef}
          nextTrackNumber={tracks.length + 1}
          releaseId={releaseId}
        />
      )}
    </>
  );
}
