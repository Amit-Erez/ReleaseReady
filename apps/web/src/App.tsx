import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./routes/LandingPage";
import { ReleasesListPage } from "./routes/ReleasesListPage";
import { ReleaseDetailPage } from "./routes/ReleaseDetailPage";
import { TrackEditorPage } from "./routes/TrackEditorPage";
import { AppShell } from "./components/layout/AppShell";


function App() {


  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<ReleasesListPage />} />
        <Route path="/releases/:releaseId" element={<ReleaseDetailPage />} />
        <Route path="/releases/:releaseId/tracks/:trackId" element={<TrackEditorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
