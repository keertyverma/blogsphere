import { Route, Routes } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import HomeLayout from "./components/layout/HomeLayout";
import Search from "./pages/Search";

import { useMediaQuery } from "@react-hook/media-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import AuthRedirect from "./components/auth/AuthRedirect";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingLayout from "./components/layout/LandingLayout";
import ChangePassword from "./components/settings/ChangePassword";
import EditProfile from "./components/settings/EditProfile";
import SideNavbar from "./components/settings/SideNavbar";
import ScrollToTopOnNavigate from "./components/shared/ScrollToTopOnNavigate";
import CustomCloseButton from "./components/ui/custom-toastify-close-button";
import { useAxiosInterceptors } from "./lib/api-client";
import { getToastOptions } from "./lib/utils";
import Bookmarks from "./pages/Bookmarks";
import DraftBlogPage from "./pages/DraftBlogPage";
import Editor from "./pages/Editor";
import EditorGuide from "./pages/EditorGuide";
import EmailVerify from "./pages/EmailVerify";
import ErrorPage from "./pages/ErrorPage";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HomePage from "./pages/HomePage";
import PublishedBlogPage from "./pages/PublishedBlogPage";
import ResendVerification from "./pages/ResendVerification";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";

const App = () => {
  // to intercept response and handle token expiration
  useAxiosInterceptors();
  const isMobile = useMediaQuery("(max-width:640px)");

  return (
    <main className="w-full h-screen">
      <ScrollToTopOnNavigate />
      <Routes>
        {/* Root path redirects based on auth status */}
        <Route path="/" element={<AuthRedirect />} />
        {/* Public Routes */}
        <Route path="/" element={<LandingLayout />}>
          <Route path="signup" element={<SignupForm />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="verify-email" element={<EmailVerify />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            path="resend-verification-link"
            element={<ResendVerification />}
          />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<ErrorPage />} />
        </Route>

        <Route path="/" element={<HomeLayout />}>
          {/* Public Routes */}
          <Route path="feed" element={<HomePage />} />
          <Route path="search" element={<Search />} />
          <Route path="user/:username" element={<UserProfile />} />
          <Route path="editor-guide" element={<EditorGuide />} />

          {/* Protected Routes */}
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SideNavbar />
              </ProtectedRoute>
            }
          >
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route
            path="bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />

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

        {/* Editor (outside layout, protected) */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:blogId"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
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
