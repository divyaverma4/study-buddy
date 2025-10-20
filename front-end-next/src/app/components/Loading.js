"use client";

import React, { useEffect, useState } from "react";
import PropagateLoader from "react-spinners/PropagateLoader";

function Loading({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      setLoading(false)
    }, 7000)
    // temporary loading screen until server gets integrated back-end for fetching 

    return () => clearTimeout(t)
  }, [])
  
  if (loading) {
    return (
      <div className="text-center flex flex-col justify-center w-full h-screen items-center">
        <PropagateLoader
          size={50}
          color={"#3192c7"}
          loading={loading}
        />
        <p className="mt-13 text-lg text-center ml-8 font-sans font-bold">Loading your Study Buddy...</p>
      </div>
    );
  }

  // When loading is complete, render the children (Navbar + Flashcard)
  return <>{children}</>;
}

export default Loading;