"use server";
import React from "react";
import Navbar from "../../components/Navbar";

async function ProgressPage({ params }) {
  const { id } = await params;

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Progress Page</h1>
          <p>Viewing progress for ID: {id}</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
