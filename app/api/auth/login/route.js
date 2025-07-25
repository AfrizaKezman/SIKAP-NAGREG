import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const { username, password } = await req.json();
  if (!username || !password) {
    return Response.json({ success: false, error: 'Username dan password wajib diisi.' }, { status: 400 });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return Response.json({ success: false, error: 'User tidak ditemukan.' }, { status: 404 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ success: false, error: 'Password salah.' }, { status: 401 });
  }
  if (!user.isApproved) {
    return Response.json({ success: false, error: 'Akun Anda belum disetujui admin.' }, { status: 403 });
  }
  // Session sederhana: set cookie 'user' dengan data user
  const userData = encodeURIComponent(JSON.stringify({ username: user.username, role: user.role, id: user._id, isApproved: user.isApproved }));
  const cookie = [
    `user=${userData}`,
    'Path=/',
    'Max-Age=86400',
    'SameSite=Strict'
  ].join('; ');
 const response = Response.json({ success: true, user: { username: user.username, role: user.role, isApproved: user.isApproved } });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
