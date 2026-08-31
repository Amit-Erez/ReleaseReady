import { Link, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { ContributorSplitEditor } from "../components/track-editor/ContributorSplitEditor";
import { TrackEditorSkeleton } from "../components/skeletons/TrackEditorSkeleton";
import { ErrorState } from "../components/errors/ErrorState";
import { CompactErrorState } from "../components/errors/CompactErrorState";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCreditsByTrackId,
  fetchReleaseById,
  fetchTracksByRelease,
} from "../lib/api";

export function TrackEditorPage() {
  const { releaseId, trackId } = useParams<{
    releaseId: string;
    trackId: string;
  }>();

  const {
    data: release,
    isLoading: isReleaseLoading,
    isError: isReleaseError,
    error: releaseError,
    refetch: refetchRelease,
  } = useQuery({
    queryKey: ["release", releaseId],
    queryFn: () => fetchReleaseById(releaseId),
  });

  const {
    data: tracks,
    isLoading: isTracksLoading,
    isError: isTracksError,
    error: tracksError,
    refetch: refetchTracks,
  } = useQuery({
    queryKey: ["tracks", releaseId],
    queryFn: () => fetchTracksByRelease(releaseId),
  });

  const {
    data: credits,
    isError: isCreditsError,
    error: creditsError,
    refetch: refetchCredits,
  } = useQuery({
    queryKey: ["credits", trackId],
    queryFn: () => fetchCreditsByTrackId(trackId),
  });

  const track = tracks?.find((t) => t.id === Number(trackId));

  if (isReleaseLoading || isTracksLoading) {
    return <TrackEditorSkeleton />;
  }

  if (isReleaseError || isTracksError) {
    const failure = releaseError ?? tracksError;
    return (
      <>
        <Link
          to="/dashboard"
          className="mb-5.5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-soft hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Releases
        </Link>
        <ErrorState
          title="Couldn't load this track"
          message={failure instanceof Error ? failure.message : "Unknown error"}
          onRetry={() => {
            refetchRelease();
            refetchTracks();
          }}
        />
      </>
    );
  }

  if (!release || !track) {
    return (
      <div>
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-text-soft hover:text-accent"
        >
          ← Releases
        </Link>
        <p className="mt-4 text-base text-text-soft">Track not found.</p>
      </div>
    );
  }

  const canSave = track.splitsTotal === 100;

  return (
    <>
      <Link
        to={`/releases/${release.id}`}
        className="mb-5.5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-soft hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ← {release.title ?? "(untitled)"}
      </Link>

      <div className="mb-7">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-text">
          {track.title}
        </h1>
        <p className="text-[0.95rem]/[normal] text-text-soft">
          Track {track.track_number}
        </p>
      </div>

      <section>
        <p className="mb-2.5 text-[0.75rem]/[normal] font-bold uppercase tracking-wide text-text-soft">
          Track details
        </p>
        <Card className="flex gap-4.5 px-5.5 py-5">
          <div className="flex-2">
            <Field id="track-title" label="Title" defaultValue={track.title} />
          </div>
          <div className="flex-2">
            <Field
              id="track-isrc"
              label="ISRC"
              defaultValue={track.isrc ?? ""}
              placeholder="Not set"
              hasError={!track.isrc}
            />
          </div>
        </Card>
      </section>

      <section className="mt-7">
        <p className="mb-2.5 text-[0.75rem]/[normal] font-bold uppercase tracking-wide text-text-soft">
          Contributors &amp; splits
        </p>
        {isCreditsError ? (
          <Card className="flex h-40 flex-col">
            <CompactErrorState
              title="Couldn't load contributors"
              message={
                creditsError instanceof Error
                  ? creditsError.message
                  : "Unknown error"
              }
              onRetry={() => refetchCredits()}
            />
          </Card>
        ) : (
          credits && (
            <ContributorSplitEditor
              rows={credits}
              splitsTotal={track.splitsTotal}
              release={release}
            />
          )
        )}
      </section>

      <Card className="mt-7 flex items-center justify-between gap-4 px-5.5 py-4.5">
        <span className="text-[0.88rem]/[normal] text-text-soft">
          Splits must total 100% before changes can be saved.
        </span>
        <Button disabled={!canSave || release.status === "submitted"}>
          Save changes
        </Button>
      </Card>
    </>
  );
}
