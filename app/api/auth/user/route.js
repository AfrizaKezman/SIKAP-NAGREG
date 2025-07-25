import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, '-password');
    return Response.json({ success: true, users });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { username, role, password, isApproved } = await req.json();
    if (!username || !role) {
      return Response.json({ success: false, error: 'Username dan role wajib diisi.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return Response.json({ success: false, error: 'Password minimal 6 karakter.' }, { status: 400 });
    }
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      role,
      password: hash,
      isApproved: typeof isApproved === 'boolean' ? isApproved : false
    });
    return Response.json({ success: true, user: { username: user.username, role: user.role, isApproved: user.isApproved } });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { id, username, role, password, isApproved } = await req.json();
    const update = { username, role };
    if (typeof isApproved !== 'undefined') update.isApproved = isApproved === true;
    if (password && password.length >= 6) {
      const bcrypt = (await import('bcryptjs')).default;
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    return Response.json({ success: true, user });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { id } = await req.json();
    await User.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
