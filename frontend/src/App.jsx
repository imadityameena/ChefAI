import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ConfirmProvider } from "./components/ConfirmDialog";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import { PageLoader } from "./components/ui";

// Pages are loaded on demand, so visitors only download the page they open
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Pantry = lazy(() => import("./pages/Pantry"));
const RecipeGenerator = lazy(() => import("./pages/RecipeGenerator"));
const MyRecipes = lazy(() => import("./pages/MyRecipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const ShoppingList = lazy(() => import("./pages/ShoppingList"));
const Settings = lazy(() => import("./pages/Settings"));
const MealPlanner = lazy(() => import("./pages/MealPlanner"));

function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Signed-in pages share one layout (sidebar + content) */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generate" element={<RecipeGenerator />} />
                <Route path="/recipes" element={<MyRecipes />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/pantry" element={<Pantry />} />
                <Route path="/meal-plan" element={<MealPlanner />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f1a15",
              color: "#f8f5ef",
              borderRadius: "10px",
              fontSize: "14px",
              padding: "10px 14px",
              boxShadow: "0 12px 32px -8px rgb(31 26 21 / 0.35)",
            },
            success: { iconTheme: { primary: "#9bc36b", secondary: "#1f1a15" } },
            error: { iconTheme: { primary: "#f2836b", secondary: "#1f1a15" } },
          }}
        />
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;
