import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

const BUCKET = 'book-covers';

// Works out a file extension from the image type.
function extFromType(type: string) {
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  if (type.includes('gif')) return 'gif';
  return 'jpg';
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseServer();
    const contentType = request.headers.get('content-type') || '';

    let bytes: ArrayBuffer;
    let fileType = 'image/jpeg';
    let nameHint = 'cover';

    if (contentType.includes('multipart/form-data')) {
      // ---- Case 1: a file uploaded from your computer ----
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      nameHint = (formData.get('name') as string) || 'cover';
      if (!file) {
        return NextResponse.json({ error: 'No file received' }, { status: 400 });
      }
      bytes = await file.arrayBuffer();
      fileType = file.type || 'image/jpeg';
    } else {
      // ---- Case 2: a pasted image URL we download server-side ----
      const { url, name } = await request.json();
      nameHint = name || 'cover';
      if (!url) {
        return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
      }
      const imgRes = await fetch(url);
      if (!imgRes.ok) {
        return NextResponse.json({ error: `Could not download image (${imgRes.status})` }, { status: 400 });
      }
      bytes = await imgRes.arrayBuffer();
      fileType = imgRes.headers.get('content-type') || 'image/jpeg';
    }

    // Build a safe, unique filename. The timestamp also busts the browser cache.
    const safeName = nameHint.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60);
    const path = `${safeName}-${Date.now()}.${extFromType(fileType)}`;

    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: fileType, upsert: true });

    if (upErr) {
      return NextResponse.json({ error: `Storage upload failed: ${upErr.message}` }, { status: 400 });
    }

    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, publicUrl: pub.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Cover save crashed' }, { status: 500 });
  }
}