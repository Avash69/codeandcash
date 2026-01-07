import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPI } from "../../api/authService.jsx";
import AnimatedCubes from "../../components/AnimatedCubes.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeout = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    setIsLoading(true); // Show loading state

    // Password validation: at least 1 capital, 1 number, 1 special character
    // const passwordPattern =
    //   /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
    // if (!passwordPattern.test(password)) {
    //   setErrorMessage(
    //     "Password must contain at least one capital letter, one number, and one special character."
    //   );
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const { error, success, token } = await loginAPI({
        email,
        password,
      });

      if (!success || error) {
        // Show specific error message from the server or a default message
        setErrorMessage(
          error || "Login failed. Please check your credentials."
        );
        setIsLoading(false);
        return;
      }

      // Check if login was successful (token is returned separately)
      if (success && token) {
        // Show success popup
        setShowSuccess(true);
        if (successTimeout.current) clearTimeout(successTimeout.current);
        successTimeout.current = setTimeout(() => {
          setShowSuccess(false);
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrorMessage("Login failed. Invalid response from server.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("An error occurred while logging in. Please try again.");
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
                Welcome back! Redirecting to dashboard...
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
        {/* Left side - Login Form */}
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
            <h2 className="mb-1 text-xl font-bold text-slate-50">
              Welcome back!
            </h2>
            <p className="text-sm text-slate-300">
              Enter to get unlimited access to data & information.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-2"
            >
              <label className="block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 transition border rounded-lg outline-none bg-indigo-800/50 border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/50 text-slate-50 placeholder-slate-400"
                placeholder="Enter your mail address"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-2"
            >
              <label className="block text-sm text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 transition border rounded-lg outline-none bg-indigo-800/50 border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/50 text-slate-50 placeholder-slate-400"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-300"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-500 rounded bg-indigo-800/50 border-slate-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="text-sm text-cyan-500 hover:underline"
              >
                Forgot your password?
              </motion.a>
            </motion.div>

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 transition duration-200 rounded-lg shadow-lg text-slate-50 shadow-indigo-600/20 ${
                isLoading
                  ? "bg-indigo-700 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                "Log in"
              )}
            </motion.button>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mt-3 text-sm text-red-200 rounded-md bg-red-900/50"
              >
                {errorMessage}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center"
            >
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm bg-indigo-900 text-slate-400">
                    Or Login with
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
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-4 mb-5 text-sm text-center text-slate-400"
            >
              Don't have an account?{" "}
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/Signup"
                className="text-yellow-500 hover:underline"
              >
                Register here
              </motion.a>
            </motion.p>
          </form>
        </motion.div>

        {/* Right side - Login Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-1/2 overflow-hidden"
        >
          <img
            src="/login.png"
            alt="Login illustration"
            className="object-cover w-full h-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
