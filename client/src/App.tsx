import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import SignupForm from "./components/auth/SignupForm";
import LoginForm from "./components/auth/LoginForm";

const App = () => {
  return (
    <main className="w-full h-screen">
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Layout />}>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
