"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { sign } from "crypto";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, signOut } = useAuth();

  //Dark/light mode for initial load
  React.useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";

    if (darkMode) {
      // Dark mode colors
      document.documentElement.style.setProperty("--background", "#0b1e3b");
      document.documentElement.style.setProperty("--foreground", "#fff4cc");
    } else {
      // Light mode colors
      document.documentElement.style.setProperty("--background", "#b4d8e7");
      document.documentElement.style.setProperty("--foreground", "#171717");
    }
  }, []);
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Progress", path: "/progress/1" }, // temporary static link for demonstration (change id in future)
    { name: "Settings", path: "/settings" },
  ];

  return (
    <nav className="h-16 w-full px-10 flex items-center justify-between bg-[#eaf7fa] shadow-md">
      <span className="font-bold text-black text-xl">Study Buddy</span>
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-6 text-black">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`cursor-pointer transition-colors ${
                isActive
                  ? "font-bold border-b-2 border-black" // if active, make it bold and underline
                  : "hover:text-gray-600" // if not active, change color on hover
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
      {isAuthenticated() ? (
        <div className="flex items-center gap-4">
          <span className="text-black">
            Hey, {currentUser.email?.split("@")[0]}!
          </span>
          <button
            type="button"
            onClick={() => signOut().then(() => router.push("/"))}
            className="bg-[#076BA1] rounded font-bold px-4 py-2 h-auto hover:bg-[#055580] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="bg-[#076BA1] rounded font-bold px-4 py-2 h-auto hover:bg-[#055580] cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
