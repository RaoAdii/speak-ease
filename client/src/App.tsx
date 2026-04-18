import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LessonLayout } from "@/layouts/LessonLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { AdminRoute, GuestRoute, ProtectedRoute } from "@/routes/ProtectedRoute";
import { SignInPage } from "@/pages/auth/SignInPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { MarketingPage } from "@/pages/marketing/MarketingPage";
import { CoursesPage } from "@/pages/CoursesPage";
import { LearnPage } from "@/pages/LearnPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { QuestsPage } from "@/pages/QuestsPage";
import { ShopPage } from "@/pages/ShopPage";
import { LessonPage } from "@/pages/LessonPage";
import { AdminPage } from "@/pages/AdminPage";

function MarketingShell() {
  return (
    <MarketingLayout>
      <Outlet />
    </MarketingLayout>
  );
}

function AuthShell() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

function MainShell() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );
}

function LessonShell() {
  return (
    <ProtectedRoute>
      <LessonLayout>
        <Outlet />
      </LessonLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingShell />}>
        <Route path="/" element={<MarketingPage />} />
      </Route>

      <Route element={<AuthShell />}>
        <Route
          path="/sign-in"
          element={
            <GuestRoute>
              <SignInPage />
            </GuestRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <GuestRoute>
              <SignUpPage />
            </GuestRoute>
          }
        />
      </Route>

      <Route element={<MainShell />}>
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/shop" element={<ShopPage />} />
      </Route>

      <Route element={<LessonShell />}>
        <Route path="/lesson" element={<LessonPage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
