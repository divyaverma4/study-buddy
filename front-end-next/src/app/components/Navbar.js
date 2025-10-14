"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathname = usePathname();

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
      <div></div>
    </nav>
  );
}

export default Navbar;
