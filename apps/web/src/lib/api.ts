import type { Release, ReleaseWithReadiness } from "@release-ready/shared";

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
