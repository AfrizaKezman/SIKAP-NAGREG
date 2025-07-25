
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const ALLOWED_EXTENSIONS = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.csv'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sk');

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const folder = formData.get('folder')?.trim();

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (!folder) {
    return NextResponse.json({ error: 'Folder is required' }, { status: 400 });
  }

  const fileName = file.name;
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const savePath = path.join(UPLOAD_DIR, folder, fileName);
  const url = `/uploads/sk/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;

  try {
    await fs.mkdir(path.join(UPLOAD_DIR, folder), { recursive: true });
    await fs.writeFile(savePath, buffer);

    // Simpan metadata ke MongoDB
    await dbConnect();
    const { default: mongoose } = await import('mongoose');
    const UploadSchema = new mongoose.Schema({
      fileName: String,
      folder: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }, { collection: 'uploads' });
    const Upload = mongoose.models.Upload || mongoose.model('Upload', UploadSchema);
    const doc = await Upload.create({ fileName, folder, url });

    return NextResponse.json({ message: 'File uploaded successfully', fileName, url, id: doc._id });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save file', details: err.message }, { status: 500 });
  }
}

// GET: /api/upload?folder=... => list file di folder, /api/upload?listFolders=1 => list seluruh folder
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');
  const listFolders = searchParams.get('listFolders');
  try {
    await dbConnect();
    const { default: mongoose } = await import('mongoose');
    const UploadSchema = new mongoose.Schema({
      fileName: String,
      folder: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }, { collection: 'uploads' });
    const Upload = mongoose.models.Upload || mongoose.model('Upload', UploadSchema);

    if (listFolders) {
      // List seluruh folder unik
      const folders = await Upload.distinct('folder');
      return NextResponse.json({ folders });
    }
    if (folder) {
      // List file di folder tertentu
      const files = await Upload.find({ folder }).sort({ uploadedAt: -1 });
      return NextResponse.json({ files: files.map(f => f.url) });
    }
    // Default: list semua file
    const files = await Upload.find({}).sort({ uploadedAt: -1 });
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch data', details: err.message }, { status: 500 });
  }
}
