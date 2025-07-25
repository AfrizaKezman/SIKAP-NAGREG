import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { username, role, password, isApproved } = await req.json();
    const update = { username, role };
    if (typeof isApproved !== 'undefined') update.isApproved = isApproved === true;
    if (password && password.length >= 6) {
      const bcrypt = (await import('bcryptjs')).default;
      update.password = await bcrypt.hash(password, 10);
    }
    const { id } = await params;
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    return Response.json({ success: true, user });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
