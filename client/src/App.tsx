import { Route, Routes } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Layout from "./pages/Layout";
import Search from "./pages/Search";

import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import { usePingServer } from "./lib/react-query/queries";
import ErrorPage from "./pages/ErrorPage";
import UserProfile from "./pages/UserProfile";
import BlogPage from "./pages/BlogPage";
import SideNavbar from "./components/settings/SideNavbar";
import ChangePassword from "./components/settings/ChangePassword";
import EditProfile from "./components/settings/EditProfile";

const App = () => {
  // to prevent the server from going into sleep mode due to inactivity.
  usePingServer();

  return (
    <main className="w-full h-screen">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<SignupForm />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="search" element={<Search />} />
          <Route path="user/:username" element={<UserProfile />} />
          <Route path="blogs/:blogId" element={<BlogPage />} />
          <Route path="settings" element={<SideNavbar />}>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blogId" element={<Editor />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      <ToastContainer hideProgressBar={true} />
    </main>
  );
};

export default App;
