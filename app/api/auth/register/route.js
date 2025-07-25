import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const { username, password } = await req.json();
  if (!username || !password) {
    return Response.json({ success: false, error: 'Semua field wajib diisi.' }, { status: 400 });
  }
  const existing = await User.findOne({ username });
  if (existing) {
    return Response.json({ success: false, error: 'Username sudah terdaftar.' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hash,
    role: 'sdm',
    isApproved: false // User baru harus diverifikasi admin
  });
  return Response.json({ success: true, user: { username: user.username, role: user.role, isApproved: user.isApproved } });
}
