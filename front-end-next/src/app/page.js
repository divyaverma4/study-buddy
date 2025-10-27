"use client";

import React from "react";
import Navbar from "./components/Navbar";
import Flashcard from "./components/Flashcard";
import Loading from "./components/Loading";


function page() {
  return (
    <Loading>
     <Navbar />
     <Flashcard />
    </Loading>

  );
}

export default page;
