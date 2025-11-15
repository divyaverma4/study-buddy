"use client";
import React from "react";
import SignUpForm from "../../components/signup-form";


export function SignUpRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4  bg-[#B4D8E7]">
      <div className="w-full max-w-md">
        <SignUpForm/>
      </div>
    </div>

  )
}

export default SignUpRoute;