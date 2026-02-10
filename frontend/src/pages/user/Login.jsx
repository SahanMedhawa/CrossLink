import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState("volunteer");
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: "" });

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const loginData = {
        ...values,
        userType,
      };

      const response = await login(loginData);
      
      if (response.success && response.data) {
        setSubmitStatus({
          type: "success",
          message: `Welcome back, ${response.data.user.name}!`,
        });

        // Store auth data and redirect
        authLogin(response.data.user, response.data.token);
        
        setTimeout(() => {
          navigate(response.data.redirectPath);
        }, 1000);
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "volunteer": return "Volunteer";
      case "ngo": return "NGO";
      case "corporate": return "Corporate";
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "volunteer":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "ngo":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "corporate":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your CrossLink account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
          {/* User Type Switch */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                {["volunteer", "ngo", "corporate"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserType(role)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      userType === role
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {getRoleIcon(role)}
                    {getRoleLabel(role)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Message */}
          {submitStatus.type && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                submitStatus.type === "success"
                  ? "bg-blue-50 border border-blue-200 text-blue-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    submitStatus.type === "success"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <p className="text-sm font-medium">{submitStatus.message}</p>
              </div>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email && touched.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.password && touched.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    `Sign in as ${getRoleLabel(userType)}`
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
