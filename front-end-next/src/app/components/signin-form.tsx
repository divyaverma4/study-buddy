"use client";
import React, {useState} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "../../firebase/auth";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { user, error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
    } else {
      // Successful sign in, redirect to home/dashboard
      router.push("/");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-blue-400 text-center ">Sign In</h2>
      <p className="text-sm text-gray-500 mt-3 text-center">Enter your details to sign in to your StudyBuddy account!</p>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
      {/* email */}
      <div className="mt-6">
      <label className="block text-sm font-medium text-blue-500">
    Email
      </label>
    <input
      id="email"
      type="email"
      value = {email}
      onChange={(e) => setEmail(e.target.value)}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
    />

    {/* password */}
    <div className="mt-4">
  <label htmlFor="password" className="block text-sm font-medium text-blue-500">
    Password
  </label>
  <input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
  />
    </div>

    {/* submit button */}
    <button
      type="submit"
      disabled={!email || !password || loading}
      className="mt-4 w-1/2 mx-auto block text-center rounded-md  bg-[#395da5] text-white py-3 hover:bg-[#2b4a89] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold"
    >
      {loading ? "Signing in..." : "Sign In"}
    </button>

    {/* sign up */}
    <p className="mt-4 text-center text-sm text-gray-600">
      Don't have an account?{" "}
      <Link href="./signup" className="text-blue-400 hover:underline font-bold">
        Sign Up
      </Link>
    </p>
</div>
    </form>
    </div>


  )
}
