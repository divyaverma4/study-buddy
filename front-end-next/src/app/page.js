"use client";

import React from "react";
import Navbar from "./components/Navbar";
import Flashcard from "./components/Flashcard";
import Loading from "./components/Loading";
import { useAuth } from "../contexts/AuthContext";

function Page() {
  const { currentUser, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // if (!isAuthenticated()) {
  //   return (
  //     <div>
  //       <span>Please sign in</span>
  //     </div>
  //   );
  // }

  // console.log("User is authenticated:", currentUser);

  return (
    <div>
      <Navbar />
      {isAuthenticated() ? (
        <Flashcard />
      ) : (
        <div className="text-center mt-10">
          <span className="text-black text-xl">
            Please sign in to access your flashcards
          </span>
        </div>
      )}
    </div>
  );
}

export default Page;
