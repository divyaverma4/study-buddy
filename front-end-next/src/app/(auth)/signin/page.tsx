"use client";
import React from "react";
import SignInForm from "../../components/signin-form";

export default function SignInRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4  bg-[#B4D8E7]">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
