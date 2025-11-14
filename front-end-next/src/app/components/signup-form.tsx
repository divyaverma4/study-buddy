"use client";
import React, {useState} from "react";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); 
  const passwordsMatch = password === confirmPassword;
  const canSubmit =
      Boolean(email) &&
      Boolean(password) &&
      Boolean(confirmPassword) &&
      passwordsMatch;

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");

  return ( 
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-blue-400 text-center ">Sign Up</h2>
      <p className="text-sm text-gray-500 mt-3 text-center">Sign Up for a StudyBuddy account!</p>

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
    {/* confirm password */}
    <div className="mt-4">
       <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-500"> Confirm Password 
        </label> 
        <input 
        id="confirmPassword" type="password" 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
        
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" /> </div>
    
    {!passwordsMatch && confirmPassword &&
    (
      <p className="mt-2 text-xs text-red-500">Passwords do not match.</p>
    )}



    {/* submit button */}
    <button
      type="submit"
      disabled={!email || !password || !canSubmit}
      className="mt-4 w-1/2 mx-auto block text-center rounded-md  bg-[#395da5] text-white py-3 hover:bg-[#2b4a89] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold"
    > Sign Up
  
    </button>

    {/* login */}
    <p className="mt-4 text-center text-sm text-gray-600">
      Already have an account?{" "}
      <Link href="./signin" className="text-blue-400 hover:underline font-bold">
        Login
      </Link>
    </p>

    {/* temporary */}
    <p className="mt-4 text-center text-sm text-gray-600">
      Back to dashboard{" "}
      <Link href="./" className="text-blue-400 hover:underline font-bold">
        Back
      </Link>
    </p>

      </div>
    </div>


  )
  
}
