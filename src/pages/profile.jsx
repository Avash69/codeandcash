import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../api/authService.jsx";
import { ScrollReveal, ScrollRevealGroup } from "../components/ScrollAnimation";

/**
 * Profile Page Component
 *
 * This component handles all aspects of user profile management:
 * - Loading profile data from the backend
 * - Updating user information
 * - Changing password
 * - Uploading profile picture
 * - WhatsApp integration
 */
const Profile = () => {
  // UI state
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Form data state with default empty values
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    workExperience: "",
    skill: "",
    email: "",
    website: "",
    phone: "",
    usesWhatsApp: false,
    bio: "",
    oldPassword: "",
    newPassword: "",
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    // Function to fetch profile data from localStorage (dummy data approach)
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await getUserProfile();

        if (error) {
          setErrorMessage("Could not load profile. Please try again later.");
          return;
        }

        if (data && data.user) {
          // Update form data with user profile data
          const userData = data.user;

          setFormData({
            username: userData.username || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            workExperience: userData.workExperience || "",
            skill: userData.skill || "",
            email: userData.email || "",
            website: userData.website || "",
            phone: userData.phone || "",
            usesWhatsApp: userData.usesWhatsApp || false,
            bio: userData.bio || "",
            oldPassword: "",
            newPassword: "",
          });

          // Set profile image URL if it exists
          if (userData.profileImageUrl) {
            setProfileImage(userData.profileImageUrl);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setErrorMessage("Could not load profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size should be less than 5MB");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
        return;
      }

      try {
        setImageUploading(true);
        setErrorMessage("");

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("profileImage", file);

        // Upload image to server
        const result = await uploadProfileImage(formData);

        if (result.success) {
          // Update profile image with the returned URL
          setProfileImage(result.imageUrl);
          setSuccessMessage("Profile picture updated successfully!");
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 4000);
        } else {
          setErrorMessage(result.error || "Failed to upload profile picture");
          setShowErrorToast(true);
          setTimeout(() => setShowErrorToast(false), 4000);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("Failed to upload profile picture");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
      } finally {
        setImageUploading(false);
      }
    }
  };

  /**
   * Handles form input changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for website field (handled separately in its own onChange)
    if (name === "website") {
      return;
    }

    // Handle checkbox inputs differently than text inputs
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    // Handle regular text inputs
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Generate username from first and last name if both are provided
      const generatedUsername =
        `${formData.firstName} ${formData.lastName}`.trim();

      // Prepare data for submission
      const profileData = {
        // Only update username if we have both first and last name, otherwise keep existing
        username: generatedUsername || formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        workExperience: formData.workExperience,
        skill: formData.skill,
        email: formData.email,
        website: formData.website.startsWith("http")
          ? formData.website
          : `https://${formData.website}`,
        phone: formData.phone,
        usesWhatsApp: formData.usesWhatsApp,
        bio: formData.bio,
      };

      // Send data to API
      const { data, error } = await updateUserProfile(profileData);

      if (error) {
        setErrorMessage(error || "Failed to update profile");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
        return;
      }

      if (data) {
        setSuccessMessage("Profile updated successfully!");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);

        // Update form data with the returned user data to ensure consistency
        if (data.user) {
          setFormData((prev) => ({
            ...prev,
            ...data.user,
            oldPassword: "",
            newPassword: "",
          }));
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setIsSubmitting(false);

      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChanging(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Make sure both passwords are provided
      if (!formData.oldPassword || !formData.newPassword) {
        setErrorMessage("Both old and new passwords are required");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
        setPasswordChanging(false);
        return;
      }

      // Call API to change password
      const result = await changePassword(
        formData.oldPassword,
        formData.newPassword
      );

      if (result.success) {
        setSuccessMessage("Password changed successfully!");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
        }));
      } else {
        setErrorMessage(result.error || "Failed to change password");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setPasswordChanging(false);
    }
  };

  // Toast notification component
  const ToastNotification = ({ message, type, show, onClose }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed z-50 flex items-center px-4 py-3 border rounded-lg shadow-lg top-4 right-4 backdrop-blur-sm"
          style={{
            background:
              type === "success"
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)",
            borderColor:
              type === "success"
                ? "rgba(16, 185, 129, 0.3)"
                : "rgba(239, 68, 68, 0.3)",
          }}
        >
          <div className="flex items-center">
            {type === "success" ? (
              <svg
                className="w-5 h-5 mr-2 text-green-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2 text-red-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="text-sm font-medium text-white">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-white transition-colors hover:text-gray-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loading state content
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-indigo-950 sm:px-6 lg:px-8">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-indigo-400 animate-spin"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-300">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      <ToastNotification
        message={successMessage}
        type="success"
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <ToastNotification
        message={errorMessage}
        type="error"
        show={showErrorToast}
        onClose={() => setShowErrorToast(false)}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-purple-900/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,_#000_0deg,_#1e1b4b_120deg,_#312e81_240deg,_#000_360deg)] opacity-10"></div>

        <div className="relative px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-12 text-center"
            >
              <div className="relative">
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-50 via-indigo-200 to-purple-200 bg-clip-text sm:text-5xl">
                  Profile Settings
                </h1>
                <div className="absolute w-20 h-1 transform -translate-x-1/2 rounded-full -top-2 left-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60"></div>
              </div>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-300">
                Manage your account settings and showcase your professional
                profile
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Profile Overview Card */}
              <ScrollReveal className="lg:col-span-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-30"></div>
                  <div className="relative p-8 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-2xl border-white/20">
                    <div className="text-center">
                      <h2 className="mb-6 text-2xl font-bold text-slate-50">
                        Profile Overview
                      </h2>

                      {/* Enhanced Profile Picture */}
                      <div className="relative inline-block mb-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          className="relative"
                        >
                          <div className="w-32 h-32 p-1 mx-auto overflow-hidden rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                            <div className="w-full h-full overflow-hidden bg-indigo-900 rounded-full">
                              {profileImage ? (
                                <img
                                  src={profileImage}
                                  alt="Profile"
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-slate-300">
                                  <svg
                                    className="w-16 h-16"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Upload Button */}
                          <label
                            htmlFor="profile-upload"
                            className="absolute p-3 transition-all duration-200 transform rounded-full shadow-lg cursor-pointer -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:scale-110 group"
                          >
                            {imageUploading ? (
                              <svg
                                className="w-4 h-4 text-white animate-spin"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            )}
                            <span className="absolute px-2 py-1 text-xs text-white transition-opacity duration-200 transform -translate-x-1/2 rounded opacity-0 -top-10 left-1/2 bg-black/80 group-hover:opacity-100 whitespace-nowrap">
                              {imageUploading ? "Uploading..." : "Change Photo"}
                            </span>
                          </label>
                          <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={imageUploading}
                          />
                        </motion.div>
                      </div>

                      {/* Profile Summary */}
                      <div className="mb-8 space-y-3">
                        <h3 className="text-xl font-semibold text-slate-50">
                          {`${formData.firstName} ${formData.lastName}`.trim() ||
                            formData.username ||
                            "User"}
                        </h3>
                        <p className="text-slate-300">{formData.email}</p>
                        {formData.skill && (
                          <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {formData.skill
                              .split(",")
                              .slice(0, 3)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-sm text-indigo-200 border rounded-full bg-indigo-500/20 border-indigo-500/30"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Security Section */}
                      <div className="p-6 border bg-slate-900/50 rounded-xl border-slate-700/50">
                        <h3 className="flex items-center mb-4 text-lg font-semibold text-slate-50">
                          <svg
                            className="w-5 h-5 mr-2 text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Security Settings
                        </h3>
                        <form
                          onSubmit={handlePasswordChange}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                              Current Password
                            </label>
                            <input
                              type="password"
                              name="oldPassword"
                              value={formData.oldPassword}
                              onChange={handleChange}
                              className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                              placeholder="Enter new password"
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={passwordChanging}
                            className="w-full px-4 py-3 font-medium text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                          >
                            {passwordChanging ? (
                              <span className="flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 mr-2 animate-spin"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Changing Password...
                              </span>
                            ) : (
                              "Change Password"
                            )}
                          </motion.button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>

              {/* Main Profile Form */}
              <ScrollReveal className="lg:col-span-8">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-30"></div>
                  <div className="relative p-8 border shadow-2xl bg-white/10 backdrop-blur-xl rounded-2xl border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <ScrollRevealGroup className="space-y-8">
                        {/* Personal Information Section */}
                        <div className="space-y-6">
                          <div className="flex items-center mb-6">
                            <div className="w-1 h-8 mr-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                            <div>
                              <h3 className="text-2xl font-bold text-slate-50">
                                Personal Information
                              </h3>
                              <p className="text-sm text-slate-300">
                                Your basic profile details
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Display Name */}
                            <div className="md:col-span-2">
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                Display Name
                              </label>
                              <input
                                type="text"
                                name="username"
                                value={
                                  `${formData.firstName} ${formData.lastName}`.trim() ||
                                  formData.username
                                }
                                disabled
                                className="block w-full px-4 py-3 border rounded-lg cursor-not-allowed bg-slate-800/30 border-slate-600/30 text-slate-400"
                              />
                              <p className="mt-2 text-xs text-slate-400">
                                {`${formData.firstName} ${formData.lastName}`.trim()
                                  ? "Display name is generated from your first and last name"
                                  : "Add your first and last name to update your display name"}
                              </p>
                            </div>

                            {/* First Name */}
                            <div>
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                First Name
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                                placeholder="Enter your first name"
                              />
                            </div>

                            {/* Last Name */}
                            <div>
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                Last Name
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                                placeholder="Enter your last name"
                              />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                Email Address
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                                placeholder="Enter your email address"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="space-y-6">
                          <div className="flex items-center mb-6">
                            <div className="w-1 h-8 mr-4 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                            <div>
                              <h3 className="text-2xl font-bold text-slate-50">
                                Professional Information
                              </h3>
                              <p className="text-sm text-slate-300">
                                Skills and experience details
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Skills */}
                            <div className="md:col-span-2">
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                Skills & Technologies
                              </label>
                              <input
                                type="text"
                                name="skill"
                                value={formData.skill}
                                onChange={handleChange}
                                placeholder="React, JavaScript, Node.js, Python, etc."
                                className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                              />
                              <p className="mt-2 text-xs text-slate-400">
                                Separate multiple skills with commas
                              </p>
                            </div>

                            {/* Experience */}
                            <div>
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                Work Experience
                              </label>
                              <select
                                name="workExperience"
                                value={formData.workExperience}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50"
                              >
                                <option value="">
                                  Select experience level
                                </option>
                                <option value="< 1 year">
                                  Less than 1 year
                                </option>
                                <option value="1-2 years">1-2 years</option>
                                <option value="3-5 years">3-5 years</option>
                                <option value="5-10 years">5-10 years</option>
                                <option value="10+ years">10+ years</option>
                              </select>
                            </div>

                            {/* Website */}
                            <div>
                              <label className="block mb-2 text-sm font-medium text-slate-300">
                                Portfolio Website
                              </label>
                              <div className="flex items-center transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                                <span className="px-3 text-sm text-slate-400">
                                  https://
                                </span>
                                <input
                                  type="text"
                                  name="website"
                                  value={formData.website.replace(
                                    /^https?:\/\//,
                                    ""
                                  )}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /^https?:\/\//,
                                      ""
                                    );
                                    setFormData((prev) => ({
                                      ...prev,
                                      website: value,
                                    }));
                                  }}
                                  placeholder="your-portfolio.com"
                                  className="block w-full px-3 py-3 bg-transparent border-0 text-slate-50 placeholder-slate-400 focus:ring-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="space-y-6">
                          <div className="flex items-center mb-6">
                            <div className="w-1 h-8 mr-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                            <div>
                              <h3 className="text-2xl font-bold text-slate-50">
                                Contact Information
                              </h3>
                              <p className="text-sm text-slate-300">
                                How others can reach you
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                              Phone Number
                            </label>
                            <div className="space-y-3">
                              <div className="relative">
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  placeholder="+1 (555) 123-4567"
                                  className="block w-full px-4 py-3 pr-12 transition-all duration-200 border rounded-lg bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      usesWhatsApp: !prev.usesWhatsApp,
                                    }));
                                  }}
                                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                                    formData.usesWhatsApp
                                      ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                      : "bg-slate-600 text-slate-400 hover:bg-slate-500"
                                  }`}
                                  title={
                                    formData.usesWhatsApp
                                      ? "WhatsApp enabled"
                                      : "Enable WhatsApp"
                                  }
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                  </svg>
                                </motion.button>
                              </div>

                              {formData.usesWhatsApp && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-green-500/10 border-green-500/20"
                                >
                                  <span className="flex items-center text-sm text-green-300">
                                    <svg
                                      className="w-4 h-4 mr-2"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    </svg>
                                    WhatsApp enabled for this number
                                  </span>
                                  {formData.phone && (
                                    <motion.a
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      href={`https://wa.me/${formData.phone.replace(
                                        /[^0-9]/g,
                                        ""
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 text-xs text-white transition-colors duration-200 bg-green-500 rounded-full hover:bg-green-600"
                                    >
                                      Test Link
                                    </motion.a>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bio Section */}
                        <div className="space-y-6">
                          <div className="flex items-center mb-6">
                            <div className="w-1 h-8 mr-4 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                            <div>
                              <h3 className="text-2xl font-bold text-slate-50">
                                About You
                              </h3>
                              <p className="text-sm text-slate-300">
                                Tell others about yourself
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-slate-300">
                              Bio
                            </label>
                            <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              rows={4}
                              maxLength={500}
                              className="block w-full px-4 py-3 transition-all duration-200 border rounded-lg resize-none bg-slate-800/50 border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-50 placeholder-slate-400"
                              placeholder="Tell potential collaborators about your background, interests, and what you're working on..."
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">
                                Share your story and what makes you unique
                              </span>
                              <span className="text-xs text-slate-400">
                                {formData.bio.length}/500 characters
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                          <motion.button
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-8 py-4 rounded-lg font-medium text-white shadow-lg transition-all duration-200 ${
                              isSubmitting
                                ? "bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl"
                            }`}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 animate-spin"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Saving Changes...
                              </span>
                            ) : (
                              "Save Changes"
                            )}
                          </motion.button>
                        </div>
                      </ScrollRevealGroup>
                    </form>
                  </div>
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
