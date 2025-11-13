"use client";

import React, { useEffect, useState } from "react";
import PropagateLoader from "react-spinners/PropagateLoader";

function Loading({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      setLoading(false)
    }, 1000)
    // temporary loading screen until server gets integrated back-end for fetching 

    return () => clearTimeout(t)
  }, [])
  
  if (loading) {
    return (
      <div className="text-center flex flex-col justify-center w-full h-screen items-center bg-[#B4D8E7]">
        <PropagateLoader
          size={50}
          color={"#3192c7"}
          loading={loading}
        />
        <p className="mt-13 text-lg text-center ml-8 font-sans font-bold">Loading your Study Buddy...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default Loading;