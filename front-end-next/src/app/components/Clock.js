"use client";
import React from "react";

export default function Clock() {
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const seconds = String(time % 60).padStart(2, "0");

  return (
    <div className="fixed bottom-4 right-4 text-4xl font-bold p-1 rounded-lg 
                    text-gray-900 dark:text-white backdrop-blur-sm">
      {minutes}:{seconds}
    </div>
  );
}
