import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WatchLater from "./pages/WatchLater";
import Watched from "./pages/Watched";
import Liked from "./pages/Liked";
import Layout from "./pages/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/watched" element={<Watched />} />
          <Route path="/watchedLater" element={<WatchLater />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}