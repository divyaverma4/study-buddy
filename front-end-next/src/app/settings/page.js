import React from "react";
import Navbar from "../components/Navbar";

function SettingsPage() {
  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Settings Page</h1>
          <p>Configure your study preferences here</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;