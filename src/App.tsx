import { Routes, Route } from "react-router-dom";
import Calculator from "./pages/Calculator";
import Blog from "./pages/Blog";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Calculator />} />
      <Route path="/blog" element={<Blog />} />
    </Routes>
  );
}
