"use client";
import { useState, useEffect } from "react";

// Komponen Ikon untuk kemudahan penggunaan
const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2h-2a1 1 0 110-2h2v-2a1 1 0 011-1z" />
  </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


export default function UserManagementPage() {
  // State untuk menyimpan daftar user, status loading, error, form, dan ID user yang sedang diedit
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "", role: "sdm" });
  const [editId, setEditId] = useState(null);

  // Mengambil data user saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi untuk mengambil data user dari API
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/user");
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
      } else {
        setError(json.error || "Gagal memuat daftar user.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mencoba memuat user.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menangani submit form (membuat atau memperbarui user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/auth/user/${editId}` : "/api/auth/user";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal menyimpan data user.");
        return;
      }
      // Reset form dan mode edit, lalu fetch ulang data user
      resetForm();
      fetchUsers();
    } catch (err) {
      setError("Terjadi kesalahan saat mencoba menyimpan user.");
    }
  };
  
  // Fungsi untuk mengaktifkan mode edit dan mengisi form dengan data user
  const handleEdit = (user) => {
    setForm({ username: user.username, password: "", role: user.role, isApproved: user.isApproved });
    setEditId(user._id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas untuk fokus ke form
  };

  // Fungsi untuk menghapus user
  const handleDelete = async (id) => {
    // Tampilan konfirmasi yang lebih baik bisa menggunakan modal
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    setError("");
    try {
      const res = await fetch(`/api/auth/user/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal menghapus user.");
        return;
      }
      fetchUsers();
    } catch (err) {
      setError("Terjadi kesalahan saat mencoba menghapus user.");
    }
  };

  // Fungsi untuk mereset form dan state edit
  const resetForm = () => {
      setEditId(null);
      setForm({ username: "", password: "", role: "sdm", isApproved: false });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* --- KARTU FORM --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-4 bg-blue-600">
                <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center">
                    <UserPlusIcon />
                    {editId ? "Edit User" : "Manajemen User"}
                </h2>
                <p className="text-blue-200 text-sm mt-1">{editId ? `Mengubah data untuk user ID: ${editId}` : "Tambah user baru ke dalam sistem"}</p>
            </div>
          
          <form className="p-6" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg" role="alert">
                <span className="font-medium">Error!</span> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Username */}
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition"
                  placeholder="e.g. john.doe"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>

              {/* Input Password */}
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition"
                  type="password"
                  placeholder={editId ? "Password baru (biarkan kosong jika tidak diubah)" : "Minimal 6 karakter"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editId}
                />
              </div>
              
              {/* Select Role */}
              <div className="md:col-span-2">
                <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="sdm">SDM</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

            {/* Checkbox Verifikasi */}
            <div className="md:col-span-2 flex items-center mt-2">
              <input
                id="isApproved"
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                checked={form.isApproved === true}
                onChange={e => setForm({ ...form, isApproved: e.target.checked })}
              />
              <label htmlFor="isApproved" className="ml-2 text-sm font-medium text-gray-700 select-none">Terverifikasi (aktif)</label>
            </div>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-6 flex items-center space-x-3">
              <button className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition-colors">
                {editId ? "Update User" : "Tambah User"}
              </button>
              {editId && (
                <button type="button" className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition-colors" onClick={resetForm}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- DAFTAR USER --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800">Daftar User Terdaftar</h3>
                <p className="text-sm text-gray-500 mt-1">Berikut adalah daftar semua user yang ada di dalam sistem.</p>
            </div>

            {loading ? (
                <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                        <tr>
                        <th scope="col" className="px-6 py-3">Username</th>
                        <th scope="col" className="px-6 py-3">Role</th>
        <th scope="col" className="px-6 py-3">Verifikasi</th>
                        <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map((user) => (
                        <tr key={user._id} className="bg-white border-b hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.username}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.isApproved === true ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Terverifikasi</span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Belum</span>
                              )}
                            </td>
                            <td className="px-6 py-4 flex justify-end items-center space-x-2">
                                <button title="Edit User" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition" onClick={() => handleEdit(user)}>
                                    <EditIcon />
                                </button>
                                <button title="Hapus User" className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition" onClick={() => handleDelete(user._id)}>
                                    <DeleteIcon />
                                </button>
                            </td>
                        </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="text-center py-10 text-gray-500">Belum ada data user.</td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
