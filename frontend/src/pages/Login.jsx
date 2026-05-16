import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import BrandLogo from "../components/BrandLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg md:grid-cols-2">
        <div className="hidden bg-linear-to-br from-emerald-50 via-white to-amber-50 p-8 md:flex md:flex-col md:justify-between">
          <BrandLogo className="scale-[1.35] origin-left" />

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              AI kitchen assistant
            </p>
            <h2 className="max-w-sm text-4xl font-black leading-tight text-gray-900">
              Turn what you have into what you crave.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-gray-600">
              Plan meals, manage pantry items, and generate recipes from a calm,
              chef-inspired workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm font-semibold text-gray-700">
            <div className="rounded-xl bg-white/80 p-3">Pantry</div>
            <div className="rounded-xl bg-white/80 p-3">Recipes</div>
            <div className="rounded-xl bg-white/80 p-3">Planner</div>
          </div>
        </div>

        <div className="w-full p-6 sm:p-8">
          {/* Logo */}
          <div className="mb-6 text-center">
            <BrandLogo className="mx-auto scale-[1.35] origin-center" />
            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600">Sign in to continue to ChefAI</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="********"
                    required
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link
                  to="/reset-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
