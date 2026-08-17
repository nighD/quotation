import { GoogleLogin } from "@react-oauth/google";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const getCleanErrorMessage = (err: any, defaultMsg: string): string => {
  const serverMsg = err.response?.data?.message || "";
  if (
    serverMsg.includes("SQLSTATE") ||
    serverMsg.includes("failed to register social user") ||
    serverMsg.includes('column "') ||
    serverMsg.includes('relation "') ||
    serverMsg.includes("ERROR:")
  ) {
    return "Something wrong. Please contact partner@goealliance.org for more information.";
  }
  return serverMsg || defaultMsg;
};

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    setEmailError("");
    setPasswordError("");
    setError("");

    if (!email.trim()) {
      setEmailError("Email là bắt buộc");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Mật khẩu là bắt buộc");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      if (data.success) {
        login(data.data.access_token, data.data.refresh_token);
        navigate("/");
      }
    } catch (err: any) {
      setError(
        getCleanErrorMessage(
          err,
          "Login failed. Please check your credentials.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
<<<<<<< HEAD
    setError("");
    try {
      const { data } = await apiClient.post("/auth/social", {
        provider: "google",
        token: credentialResponse.credential,
      });
=======
    setError('');

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
>>>>>>> 581e303f5aba7301e8030c3f127a428477bde9fd
      if (data.success) {
        login(data.data.access_token, data.data.refresh_token);
        navigate("/");
      }
    } catch (err: any) {
<<<<<<< HEAD
      setError(getCleanErrorMessage(err, "Google Login failed."));
=======
      setError(getCleanErrorMessage(err, 'Login failed. Please check your credentials.'));
>>>>>>> 581e303f5aba7301e8030c3f127a428477bde9fd
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#111] bg-cover bg-top bg-no-repeat flex flex-col font-poppins relative"
      style={{ backgroundImage: "url('/bg-login-new.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full pb-20">
        <div className="bg-white rounded-[32px] p-8 sm:p-10 md:px-11 md:py-14 w-full max-w-[460px] min-h-[560px] flex flex-col justify-between shadow-xl shadow-[#523C37]/5 border border-[#EBE1D5]">
          {/* Top Header */}
          <div className="w-full">
            <h2 className="text-[32px] md:text-[38px] font-semibold! text-[#1B1A16] font-['Cormorant_Garamond']! text-center tracking-tight">
              Sign In
            </h2>

<<<<<<< HEAD
            {error && (
              <div className="mt-4 p-3.5 bg-[#F8E4DD] border border-[#E9C6B8] rounded-2xl text-[#9A4D3A] font-['Inter'] text-sm text-center">
                {error}
              </div>
            )}
          </div>

          {/* Form with Middle Inputs and Bottom Button */}
          <form
            onSubmit={handleEmailSubmit}
            noValidate
            className="flex flex-col justify-between flex-1 mt-6"
          >
            {/* Middle: Inputs */}
            <div className="flex flex-col gap-5 my-auto">
              <div>
                <label className="block mb-2.5 text-[14px] font-['Inter'] font-medium text-[#523C37]">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail
                    className="absolute left-4.5 w-5 h-5 text-[#B58F6F] pointer-events-none"
                    strokeWidth={1.5}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="your.email@example.com"
                    className={`w-full bg-[#F8F1EA] text-[#1B1A16] placeholder:text-[#8B837C]/70 text-[15px] font-['Inter'] rounded-2xl py-4 pl-13 pr-4 outline-none border transition-all ${
                      emailError
                        ? "border-[#9A4D3A] focus:border-[#9A4D3A]"
                        : "border-[#E4D6CA] focus:border-[#B58F6F] focus:bg-white"
=======
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block mb-2 text-[14px] text-[#a1a1aa]">Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-white/60 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="your.email@example.com"
                  className={`w-full bg-[#313131] text-white/60 placeholder:text-white/40 text-[15px] rounded-[14px] py-3.5 pl-12 pr-4 outline-none border transition ${emailError ? 'border-red-500/80 focus:border-red-500' : 'border-transparent focus:border-white/30'
>>>>>>> 581e303f5aba7301e8030c3f127a428477bde9fd
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-[12px] text-[#9A4D3A] font-['Inter'] font-medium">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2.5 text-[14px] font-['Inter'] font-medium text-[#523C37]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock
                    className="absolute left-4.5 w-5 h-5 text-[#B58F6F] pointer-events-none"
                    strokeWidth={1.5}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="********"
                    className={`w-full bg-[#F8F1EA] text-[#1B1A16] placeholder:text-[#8B837C]/70 text-[15px] font-['Inter'] rounded-2xl py-4 pl-13 pr-4 outline-none border transition-all ${
                      passwordError
                        ? "border-[#9A4D3A] focus:border-[#9A4D3A]"
                        : "border-[#E4D6CA] focus:border-[#B58F6F] focus:bg-white"
                    }`}
                  />
                </div>
                {passwordError && (
                  <p className="mt-1.5 text-[12px] text-[#9A4D3A] font-['Inter'] font-medium">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

<<<<<<< HEAD
            {/* Bottom: Sign In Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#523C37] hover:bg-[#382b24] text-white font-['Inter'] font-medium text-[13px] uppercase tracking-wider px-12 py-3.5 rounded-full transition-all disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
              >
                {loading ? "Processing..." : "Sign in"}
              </button>
            </div>
=======
            <div>
              <label className="block mb-2 text-[14px] text-[#a1a1aa]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-white/60 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="********"
                  className={`w-full bg-[#313131] text-white/60 placeholder:text-white/40 text-[15px] rounded-[14px] py-3.5 pl-12 pr-4 outline-none border transition ${passwordError ? 'border-red-500/80 focus:border-red-500' : 'border-transparent focus:border-white/30'
                    }`}
                />
              </div>
              {passwordError && (
                <p className="mt-1.5 text-[13px] text-red-500 font-['Inter'] font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 mx-auto block bg-white text-black px-12 py-[12px] rounded-full font-medium text-[16px] hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>
>>>>>>> 581e303f5aba7301e8030c3f127a428477bde9fd
          </form>
        </div>
      </div>
    </div>
  );
}
