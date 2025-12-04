"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, signOut } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Quiz", path: "/quiz" },
    { name: "Progress", path: "/progress" },
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
