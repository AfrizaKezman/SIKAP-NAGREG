"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import {
    UsersIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon,
    DocumentDuplicateIcon,
    ArrowRightIcon,
    BuildingOffice2Icon
} from "@heroicons/react/24/outline";

// Komponen untuk kartu fitur, tidak ada perubahan
const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-blue-500/20">
        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-gray-800 text-blue-400 rounded-full border-2 border-blue-500/30">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

// Komponen untuk bagian header (Hero) dengan nama baru
const HeroSection = () => (
    <div className="text-center py-20 md:py-32 px-4 relative overflow-hidden">
        {/* Efek grid di background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+PGcgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMCAwIEwyMCAyMCI+PC9wYXRoPjxwYXRoIGQ9Ik0wIDIwIEwyMCAwIj48L3BhdGg+PC9nPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
        <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2 tracking-tight">
                SIKAP NAGREG
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-4 font-medium">
                Sistem Informasi Kepegawaian dan Arsip Terpadu Kecamatan Nagreg.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 transform hover:scale-105 mt-2">
                Masuk ke Sistem <ArrowRightIcon className="w-5 h-5" />
            </Link>
        </div>
    </div>
);

export default function LandingPage() {
    // EFEK: Mengubah background body saat komponen ini aktif
    useEffect(() => {
        // Simpan warna background asli
        const originalColor = document.body.style.backgroundColor;
        // Atur background body ke tema gelap halaman ini
        document.body.style.backgroundColor = '#111827'; // Tailwind's bg-gray-900

        // Fungsi cleanup untuk mengembalikan warna background saat komponen dilepas
        return () => {
            document.body.style.backgroundColor = originalColor;
        };
    }, []); // Array dependensi kosong agar efek ini hanya berjalan sekali saat mount dan cleanup saat unmount

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            {/* Efek gradien di background */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/40 -z-10"></div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Navigasi dengan nama baru */}

                {/* Hero Section */}
                <HeroSection />

                {/* Features Section */}
                <main className="py-0 md:py-0">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Mewujudkan Birokrasi Modern</h2>
                        <p className="text-gray-400 mt-2">Semua yang Anda butuhkan untuk manajemen kepegawaian yang efisien.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<UsersIcon className="w-8 h-8" />}
                            title="Data Induk Terpusat"
                            description="Kelola seluruh data pegawai dari satu tempat dengan pencarian dan filter canggih."
                        />
                        <FeatureCard
                            icon={<ArrowTrendingUpIcon className="w-8 h-8" />}
                            title="Riwayat Karir Otomatis"
                            description="Pantau histori kenaikan pangkat dan gaji secara otomatis dan akurat."
                        />
                        <FeatureCard
                            icon={<DocumentDuplicateIcon className="w-8 h-8" />}
                            title="Arsip Digital Aman"
                            description="Unggah, simpan, dan kelola dokumen SK secara digital, mudah diakses kapan saja."
                        />
                        <FeatureCard
                            icon={<ShieldCheckIcon className="w-8 h-8" />}
                            title="Manajemen Akses"
                            description="Kontrol penuh hak akses untuk menjaga keamanan data."
                        />
                    </div>
                </main>
            </div>

            {/* Footer dengan nama baru */}
            <footer className="bg-gray-900 border-t border-gray-800">
                <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} SIKAP NAGREG. Hak Cipta Dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}
