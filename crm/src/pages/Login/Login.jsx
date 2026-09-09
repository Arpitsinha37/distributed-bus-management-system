



import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { postData } from "../../services/apiService";

export default function Login() {
  const [role, setRole] = useState("agent");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const [mode, setMode] = useState("login");


  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await postData("/api/auth/login", {
        email,
        password,
        role,
      });

      if (res?.role === "admin") {
        sessionStorage.setItem("adminsession", res.token);
        sessionStorage.setItem("role", "admin");
        navigate("/admin");
      } else if (res?.role === "agent") {
        sessionStorage.setItem("adminsession", res.token);
        sessionStorage.setItem("agentID", res.user.id);
        sessionStorage.setItem("role", "agent");
        navigate("/agent");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Invalid email or password");
    }
  };


  const sendOtp = async () => {
    try {
      await postData("/api/auth/forgot-password-otp", {
        email,
        role,
      });
      setMode("reset");
      setError("");
    } catch {
      setError("Failed to send OTP");
    }
  };


  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await postData("/api/auth/verify-otp-update-password", {
        email,
        otp,
        password: newPassword,
        role,
      });

      setMode("login");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");

    } catch {
      setError("Invalid OTP or update failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-[400px] bg-white shadow-lg rounded-2xl p-8">


        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-blue-600">✈️</span>
          </div>
        </div>

        <h2 className="text-center text-xl font-semibold text-gray-800">
          Travel Booking System
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Login to manage bookings and agents
        </p>

        <div className="flex bg-gray-100 rounded-full mb-6">
          <button
            onClick={() => {
              setRole("admin");
              setMode("login");
            }}
            className={`flex-1 py-2 rounded-full ${role === "admin"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600"
              }`}
          >
            Admin
          </button>

          <button
            onClick={() => {
              setRole("agent");
              setMode("login");
            }}
            className={`flex-1 py-2 rounded-full ${role === "agent"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600"
              }`}
          >
            Agent
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}


        <form
          onSubmit={mode === "login" ? handleSubmit : (e) => e.preventDefault()}
          className="space-y-4"
        >
          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${role}@travel.com`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          {mode === "login" && (
            <div className="relative">
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[35px] text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}


          {mode === "login" && (
            <p
              onClick={() => setMode("forgot")}
              className="text-sm text-blue-600 text-right cursor-pointer"
            >
              Forgot Password?
            </p>
          )}




          {mode === "reset" && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-[35px] text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>


              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[35px] text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          )}



          {mode === "login" && (
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg">
              Login as {role === "admin" ? "Admin" : "Agent"}
            </button>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={sendOtp}
              className="w-full py-2 bg-blue-600 text-white rounded-lg"
            >
              Send OTP
            </button>
          )}

          {mode === "reset" && (
            <button
              type="button"
              onClick={updatePassword}
              className="w-full py-2 bg-blue-600 text-white rounded-lg"
            >
              Update Password
            </button>
          )}
        </form>

        <p className="text-center text-gray-400 text-xs mt-4">
          Demo: admin@travel.com / agent@travel.com | Pass: 123456
        </p>
      </div>
    </div>
  );
}
