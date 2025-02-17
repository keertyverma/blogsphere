import { Route, Routes } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Layout from "./pages/Layout";
import Search from "./pages/Search";

import { useMediaQuery } from "@react-hook/media-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ChangePassword from "./components/settings/ChangePassword";
import EditProfile from "./components/settings/EditProfile";
import SideNavbar from "./components/settings/SideNavbar";
import ScrollToTopOnNavigate from "./components/shared/ScrollToTopOnNavigate";
import CustomCloseButton from "./components/ui/custom-toastify-close-button";
import { useAxiosInterceptors } from "./lib/api-client";
import { usePingServer } from "./lib/react-query/queries";
import { getToastOptions } from "./lib/utils";
import Bookmarks from "./pages/Bookmarks";
import DraftBlogPage from "./pages/DraftBlogPage";
import Editor from "./pages/Editor";
import EmailVerify from "./pages/EmailVerify";
import ErrorPage from "./pages/ErrorPage";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import PublishedBlogPage from "./pages/PublishedBlogPage";
import ResendVerification from "./pages/ResendVerification";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";

const App = () => {
  // to prevent the server from going into sleep mode due to inactivity.
  usePingServer();
  // to intercept response and handle token expiration
  useAxiosInterceptors();
  const isMobile = useMediaQuery("(max-width:640px)");

  return (
    <main className="w-full h-screen">
      <ScrollToTopOnNavigate />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<SignupForm />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="search" element={<Search />} />
          <Route path="user/:username" element={<UserProfile />} />
          <Route path="settings" element={<SideNavbar />}>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="bookmarks" element={<Bookmarks />} />

          {/* Explicitly handle the /blogs/drafts route to prevent any conflicts with the dynamic /blogs/:blogId route. */}
          <Route path="blogs/drafts" element={<ErrorPage />} />
          <Route
            path="blogs/drafts/:blogId"
            element={
              <ProtectedRoute>
                <DraftBlogPage />
              </ProtectedRoute>
            }
          />
          <Route path="blogs/:blogId" element={<PublishedBlogPage />} />
        </Route>

        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blogId" element={<Editor />} />
        <Route path="/verify-email" element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/resend-verification-link"
          element={<ResendVerification />}
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      <ToastContainer
        {...getToastOptions()}
        position={isMobile ? "bottom-center" : "bottom-right"}
        closeButton={<CustomCloseButton />}
        draggable={isMobile} // Draggable only on mobile
        draggableDirection="y"
        toastClassName="bg-secondary text-secondary-foreground border border-muted-foreground/40 my-2"
      />
    </main>
  );
};

export default App;
