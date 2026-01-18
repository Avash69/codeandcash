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
    <div className="flex items-center justify-center w-full h-screen p-4 bg-background">
      <AnimatedCubes count={10} />

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed z-50 -translate-x-1/2 top-8 left-1/2">
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
            className="flex items-center px-6 py-4 border shadow-2xl rounded-2xl bg-surface border-success/20 backdrop-blur-lg"
            style={{ minWidth: 320 }}
          >
            <div className="flex items-center justify-center w-8 h-8 mr-4 text-white bg-green-500 rounded-full shadow-lg shadow-green-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">
                Success!
              </div>
              <div className="text-sm text-text-secondary">
                {successMessage || "Account created. Redirecting..."}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1200px] h-[800px] rounded-3xl shadow-2xl flex overflow-hidden bg-surface border border-border"
      >
        {/* Left side - Signup Image (SWAPPED) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-1/2 overflow-hidden bg-surfaceHighlight hidden md:block"
        >
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2574&auto=format&fit=crop"
            alt="Signup illustration"
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/80 to-transparent z-20 text-white">
            <h3 className="text-2xl font-bold mb-2">Join the Community.</h3>
            <p className="opacity-90">Start your journey with Codexa and unlock new possibilities.</p>
          </div>
        </motion.div>

        {/* Right side - Signup Form (SWAPPED) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex flex-col justify-center w-full md:w-1/2 p-12 bg-surface text-text-primary overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-text-primary">
              Create Account
            </h2>
            <p className="text-text-secondary">
              Fill in your details to get started.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-text-secondary">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 transition-all border rounded-xl outline-none bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-muted"
                placeholder="John Doe"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 transition-all border rounded-xl outline-none bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-muted"
                placeholder="name@example.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 transition-all border rounded-xl outline-none bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-muted"
                  placeholder="Create a password"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 transition-all border rounded-xl outline-none bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-muted"
                  placeholder="Confirm your password"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-text-muted hover:text-text-primary"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Error Message Display */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 text-sm font-medium text-red-600 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20"
              >
                {errorMessage}
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
              className={`w-full py-3.5 font-medium transition duration-200 rounded-xl shadow-lg shadow-primary/25 text-white ${isLoading
                  ? "bg-primary/70 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover hover:shadow-primary/40"
                }`}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </motion.button>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-6 mb-4 text-center text-text-secondary"
            >
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
