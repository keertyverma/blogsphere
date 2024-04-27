import { Route, Routes } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Layout from "./pages/Layout";

import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";

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

      <ToastContainer hideProgressBar={true} />
    </main>
  );
};

export default App;
