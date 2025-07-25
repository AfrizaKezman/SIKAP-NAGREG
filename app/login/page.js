"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BuildingOffice2Icon, UserIcon as UserOutlineIcon, LockClosedIcon } from "@heroicons/react/24/outline";

// Komponen Ikon SVG untuk kemudahan
const UserIcon = ({ className }) => <UserOutlineIcon className={className} />;
const LockIcon = ({ className }) => <LockClosedIcon className={className} />;

export default function LoginPage() {
    // State untuk form, error, dan loading
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // EFEK: Mengubah background body saat komponen ini aktif
    useEffect(() => {
        document.body.style.backgroundColor = '#111827'; // Tailwind's bg-gray-900
        return () => {
            document.body.style.backgroundColor = ''; // Kembalikan ke default saat unmount
        };
    }, []);

    // Fungsi untuk menangani proses login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const json = await res.json();

            if (!json.success) {
                setError(json.error || "Username atau password salah.");
                return;
            }

            // Arahkan pengguna berdasarkan role
            if (json.user.role === "admin") {
                window.location.href = "/user";
            } else if (json.user.role === "sdm") {
                window.location.href = "/induk";
            } else {
                window.location.href = "/";
            }
        } catch (err) {
            setError("Gagal terhubung ke server. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <BuildingOffice2Icon className="w-10 h-10 text-blue-500"/>
                        <span className="text-3xl font-bold text-white">
                           SIKAP <span className="text-blue-400">NAGREG</span>
                        </span>
                    </Link>
                    <p className="text-gray-400">Sistem Informasi Kepegawaian & Arsip Terpadu</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-center mb-1 text-white">Selamat Datang Kembali</h2>
                    <p className="text-center text-gray-400 mb-6">Masuk untuk melanjutkan ke dasbor Anda.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Pesan Error */}
                        {error && (
                            <div className="p-3 text-sm text-red-300 bg-red-500/20 border border-red-500/30 rounded-lg" role="alert">
                                {error}
                            </div>
                        )}

                        {/* Input Username */}
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                className="w-full bg-gray-900/70 border border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 pl-12 transition placeholder-gray-500"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Input Password */}
                        <div className="relative">
                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                className="w-full bg-gray-900/70 border border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 pl-12 transition placeholder-gray-500"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Tombol Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? 'Memproses...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Belum punya akun? </span>
                        <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                            Daftar di sini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
