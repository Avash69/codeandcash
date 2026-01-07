import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupAPI } from "../../api/authService.jsx";
import AnimatedCubes from "../../components/AnimatedCubes.jsx";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeout = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setIsLoading(true); // Show loading state

    // Basic client-side validation for password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const { error, success } = await signupAPI({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (!success || error) {
        setErrorMessage(error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Show success message and popup
      setSuccessMessage("Registration successful! Redirecting to login...");
      setShowSuccess(true);
      setIsLoading(false);

      if (successTimeout.current) clearTimeout(successTimeout.current);
      successTimeout.current = setTimeout(() => {
        setShowSuccess(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("An error occurred during registration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen p-4 bg-indigo-950">
      <AnimatedCubes count={10} />

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed z-50 -translate-x-1/2 top-8 left-1/2">
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
            className="flex items-center px-6 py-4 border-2 shadow-2xl rounded-2xl bg-gradient-to-r from-green-500/90 to-emerald-600/90 border-green-400/60 backdrop-blur-lg"
            style={{ minWidth: 320 }}
          >
            <svg
              className="w-8 h-8 mr-4 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="#22c55e"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4"
                stroke="#fff"
              />
            </svg>
            <div>
              <div className="text-lg font-bold text-white drop-shadow">
                Log in Successful
              </div>
              <div className="text-sm text-green-100">
                Welcome! Redirecting to login...
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1200px] h-[700px] rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.9)] flex overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-950"
      >
        {/* Left side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex flex-col justify-center w-1/2 p-12 bg-indigo-900/50 backdrop-blur-sm text-slate-50"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="mt-5 mb-1 text-xl font-bold text-slate-50">
              Create Account
            </h2>
            <p className="text-sm text-slate-300">
              Join us to access unlimited data & information.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-2"
            >
              <label className="block text-sm text-slate-300">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 transition border rounded-lg outline-none bg-indigo-800/50 border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/50 text-slate-50 placeholder-slate-400"
                placeholder="Enter your full name"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-2"
            >
              <label className="block text-sm text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 transition border rounded-lg outline-none bg-indigo-800/50 border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/50 text-slate-50 placeholder-slate-400"
                placeholder="Enter your email address"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-2"
            >
              <label className="block text-sm text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 transition border rounded-lg outline-none bg-indigo-800/50 border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/50 text-slate-50 placeholder-slate-400"
                  placeholder="Create a password"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-300"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="space-y-2"
            >
              <label className="block text-sm text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 transition border rounded-lg outline-none bg-indigo-800/50 border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/50 text-slate-50 placeholder-slate-400"
                  placeholder="Confirm your password"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-300"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </motion.button>
              </div>
            </motion.div>

            {/* Error Message Display */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-200 border rounded-lg bg-red-500/20 border-red-500/30"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-green-200 border rounded-lg bg-green-500/20 border-green-500/30"
              >
                {successMessage}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-6 transition duration-200 bg-indigo-600 rounded-lg shadow-lg text-slate-50 hover:bg-indigo-500 shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-center"
            >
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm bg-indigo-900 text-slate-400">
                    Or Sign up with
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center justify-center w-full py-3 space-x-2 transition duration-200 border rounded-lg border-slate-600 text-slate-300 hover:bg-indigo-800/70"
                disabled
              >
                <span className="text-xl">G</span>
                <span>Sign up with google</span>
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-4 mb-5 text-sm text-center text-slate-400"
            >
              Already have an account?{" "}
              <Link to="/login" className="text-yellow-500 hover:underline">
                Login here
              </Link>
            </motion.p>
          </form>
        </motion.div>

        {/* Right side - Signup Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-1/2 overflow-hidden"
        >
          <img
            src="/login.png"
            alt="Signup illustration"
            className="object-cover w-full h-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
