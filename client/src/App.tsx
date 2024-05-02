import { Route, Routes } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Layout from "./pages/Layout";

import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import Editor from "./pages/Editor";
import Home from "./pages/Home";

const App = () => {
  return (
    <main className="w-full h-screen">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Route>

        <Route path="/editor" element={<Editor />} />
      </Routes>

      <ToastContainer hideProgressBar={true} />
    </main>
  );
};

export default App;
