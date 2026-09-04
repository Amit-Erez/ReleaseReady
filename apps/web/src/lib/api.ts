import type {
  Contributor,
  CreateContributorInput,
  CreateReleaseInput,
  CreateTrackInput,
  MoveTrackInput,
  Release,
  ReleaseWithReadiness,
  ReplaceTrackContributorsInput,
  Track,
  TrackCredit,
  TrackWithSplits,
  UpdateTrackInput,
} from "@release-ready/shared";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchReleases(): Promise<ReleaseWithReadiness[]> {
  const res = await fetch(`${API_URL}/api/releases`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const data = await res.json();
  return data.map((release: Release) => ({
    ...release,
    release_date: new Date(release.release_date),
  }));
}

export async function fetchReleaseById(
  id?: string,
): Promise<ReleaseWithReadiness> {
  const res = await fetch(`${API_URL}/api/releases/${id}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const data = await res.json();
  return {
    ...data,
    release_date: new Date(data.release_date),
  };
}

export async function fetchTracksByRelease(
  id?: string,
): Promise<TrackWithSplits[]> {
  const res = await fetch(`${API_URL}/api/releases/${id}/tracks`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const data = await res.json();
  return data;
}

export async function fetchCreditsByTrackId(
  id?: string,
): Promise<TrackCredit[]> {
  const res = await fetch(`${API_URL}/api/tracks/${id}/contributors`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const data = await res.json();
  return data;
}

export async function createNewTrack(
  id: string,
  data: CreateTrackInput,
): Promise<Track> {
  const res = await fetch(`${API_URL}/api/releases/${id}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const track = await res.json();
  return track;
}

export async function moveTrack(
  trackId: number,
  direction: MoveTrackInput["direction"],
): Promise<Track[]> {
  const res = await fetch(`${API_URL}/api/tracks/${trackId}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  return res.json();
}

export async function createNewRelease(
  data: CreateReleaseInput,
): Promise<Release> {
  const res = await fetch(`${API_URL}/api/releases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const release = await res.json();
  return release;
}

export async function updateExistingTrack(
  trackId: string,
  data: UpdateTrackInput,
): Promise<Track> {
  const res = await fetch(`${API_URL}/api/tracks/${trackId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const track = await res.json();
  return track;
}

export async function fetchContributorsByReleaseId(
  id?: string,
): Promise<Contributor[]> {
  const res = await fetch(`${API_URL}/api/releases/${id}/contributors`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const contributors = await res.json();
  return contributors;
}

export async function addContributor(
  data: CreateContributorInput,
): Promise<Contributor> {
  const res = await fetch(`${API_URL}/api/contributors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const contributor = await res.json();
  return contributor;
}

export async function createTrackCreditSplits(
  data: ReplaceTrackContributorsInput,
  trackId: string,
): Promise<TrackCredit[]> {
  const res = await fetch(`${API_URL}/api/tracks/${trackId}/contributors`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
  const splits = await res.json();
  return splits;
}
