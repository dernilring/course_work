import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WatchLater from "./pages/WatchLater";
import Watched from "./pages/Watched";
import Liked from "./pages/Liked";
import Layout from "./pages/Layout";
import Disliked from "./pages/Disliked";
import FilmDetailed from "./pages/FilmDetailed";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/disliked" element={<Disliked />} />
          <Route path="/watched" element={<Watched />} />
          <Route path="/watchedLater" element={<WatchLater />} />
          <Route path="/film/:id" element={<FilmDetailed/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}