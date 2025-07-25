"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  ClockIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";

// Kumpulan item navigasi berdasarkan peran
const navItemsByRole = {
  admin: [{ href: "/user", icon: UserGroupIcon, label: "Manajemen User" }],
  sdm: [
    { href: "/induk", icon: UserGroupIcon, label: "Data Induk" },
    { href: "/naikgaji", icon: CurrencyDollarIcon, label: "Kenaikan Gaji" },
    { href: "/naikpangkat", icon: ArrowTrendingUpIcon, label: "Kenaikan Pangkat" },
    { href: "/arsip", icon: ArchiveBoxIcon, label: "Arsip" },
    { href: "/uploadsk", icon: ArrowDownTrayIcon, label: "Upload SK" },
  ],
};

// Komponen untuk setiap link navigasi dengan penanda aktif
const NavLink = ({ href, icon: Icon, label }) => {
  const pathname = usePathname();
  // Memeriksa apakah path saat ini sama dengan href link
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
        // Menerapkan style berbeda jika link sedang aktif
        isActive
          ? "bg-gray-700 text-white" // Style untuk link aktif
          : "text-gray-400 hover:bg-gray-700 hover:text-white" // Style untuk link tidak aktif
        }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
};


export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Efek untuk menandai bahwa komponen sudah di-mount di client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Efek untuk memeriksa status login dari cookie secara berkala
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastUserJson = null;
    const checkUser = () => {
      const match = window.document.cookie.match(/user=([^;]+)/);
      const currentUserJson = match ? match[1] : null;

      if (currentUserJson !== lastUserJson) {
        lastUserJson = currentUserJson;
        if (currentUserJson) {
          try {
            const userObj = JSON.parse(decodeURIComponent(currentUserJson));
            setUser(userObj);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    checkUser(); // Panggil sekali saat inisialisasi
    const interval = setInterval(checkUser, 1000); // Polling setiap detik
    window.addEventListener('focus', checkUser); // Cek juga saat window kembali fokus

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkUser);
    };
  }, []);

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    document.cookie = 'user=; Path=/; Max-Age=0';
    setUser(null);
    window.location.href = '/login';
  };

  // Konten navigasi yang dirender secara kondisional
  const renderNavContent = () => {
    // Jika belum login
    if (!user) {
      return (
        <div className="flex flex-col items-center text-center px-4 py-8">
          <p className="text-gray-400 mb-4">Silakan login untuk mengakses sistem.</p>
          <Link href="/login" className="flex items-center gap-2 w-full justify-center bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Login
          </Link>
        </div>
      );
    }
    // Jika akun belum diverifikasi
    if (!user.isApproved) {
      return (
        <div className="text-center bg-yellow-900/50 text-yellow-300 p-4 m-2 rounded-lg">
          <ClockIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Menunggu Persetujuan</p>
          <p className="text-xs mt-1">Akun Anda sedang diverifikasi oleh admin.</p>
        </div>
      );
    }
    // Jika sudah login dan diverifikasi
    const navItems = navItemsByRole[user.role] || [];
    return (
      <div className="flex flex-col gap-1">
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header Sidebar */}
      <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <BuildingOffice2Icon className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold text-white">
            SIKAP <span className="text-blue-400">NAGREG</span>
          </span>
        </Link>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(false)} aria-label="Tutup menu">
          <XMarkIcon className="w-7 h-7" />
        </button>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 mt-4 px-2">
        {isClient ? renderNavContent() : <div className="text-gray-400 text-center p-4">Memuat...</div>}
      </nav>

      {/* Profile/Logout Section */}
      {isClient && user && (
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-sm">{user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 rounded-lg hover:bg-red-800/50 hover:text-red-300 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Tombol menu untuk mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        <Bars3Icon className="w-7 h-7" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-xl flex-col z-[60] transition-transform duration-300 ease-in-out md:translate-x-0 md:flex md:w-64
                ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>

      {/* Overlay untuk mobile saat sidebar terbuka */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
}
