import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";

const App = () => {
  return (
    <main className="w-full h-screen">
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Layout />}>
          <Route path="/signup" element={<h1>Signup page</h1>} />
          <Route path="/login" element={<h1>Login page</h1>} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
