import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import SignupForm from "./components/auth/SignupForm";

const App = () => {
  return (
    <main className="w-full h-screen">
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Layout />}>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<h1>login</h1>} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
