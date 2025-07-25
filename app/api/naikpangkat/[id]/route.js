import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const COLLECTION = "naikpangkat";

export async function PUT(req, { params }) {
  try {
    const nip = params.id;
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();
    await db.collection(COLLECTION).updateOne(
      { "static.2": nip },
      { $set: body }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const nip = params.id;
    const client = await clientPromise;
    const db = client.db();
    await db.collection(COLLECTION).deleteOne({ "static.2": nip });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
