import { createHash } from "node:crypto";

export const runtime = "nodejs";

const wardrobeFolder = "nekofit/wardrobe";
const maximumFileSize = 4_000_000;

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

function signParameters(parameters: Record<string, string>, apiSecret: string) {
  const value = Object.entries(parameters)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, parameter]) => `${key}=${parameter}`)
    .join("&");
  return createHash("sha1").update(`${value}${apiSecret}`).digest("hex");
}

function transformedImageUrl(cloudName: string, publicId: string, version: number) {
  const encodedPublicId = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/e_background_removal/f_png,q_auto/v${version}/${encodedPublicId}.png`;
}

export async function POST(request: Request) {
  const config = getCloudinaryConfig();
  if (!config) {
    return Response.json({ message: "Cloudinary todavía no está configurado en NekoFit." }, { status: 503 });
  }

  let requestData: FormData;
  try {
    requestData = await request.formData();
  } catch {
    return Response.json({ message: "Selecciona una fotografía antes de continuar." }, { status: 400 });
  }
  const file = requestData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ message: "Selecciona una imagen JPG, PNG o WebP válida." }, { status: 400 });
  }
  if (file.size > maximumFileSize) {
    return Response.json({ message: "La fotografía debe pesar menos de 4 MB." }, { status: 413 });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = signParameters({ folder: wardrobeFolder, timestamp }, config.apiSecret);
  const uploadData = new FormData();
  uploadData.set("file", file);
  uploadData.set("api_key", config.apiKey);
  uploadData.set("timestamp", timestamp);
  uploadData.set("folder", wardrobeFolder);
  uploadData.set("signature", signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`, {
      method: "POST",
      body: uploadData,
    });
    const payload = await response.json() as { public_id?: string; secure_url?: string; version?: number; error?: { message?: string } };

    if (!response.ok || !payload.public_id || !payload.secure_url || !payload.version) {
      return Response.json({ message: payload.error?.message ?? "Cloudinary no pudo procesar la imagen." }, { status: 502 });
    }

    return Response.json({
      publicId: payload.public_id,
      originalUrl: payload.secure_url,
      displayUrl: transformedImageUrl(config.cloudName, payload.public_id, payload.version),
    });
  } catch {
    return Response.json({ message: "No fue posible conectar con Cloudinary." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const config = getCloudinaryConfig();
  if (!config) return Response.json({ message: "Cloudinary todavía no está configurado." }, { status: 503 });

  const payload = await request.json() as { publicId?: string };
  const publicId = payload.publicId?.trim();
  if (!publicId || !publicId.startsWith(`${wardrobeFolder}/`)) {
    return Response.json({ message: "La imagen indicada no pertenece al armario." }, { status: 400 });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const parameters = { invalidate: "true", public_id: publicId, timestamp };
  const destroyData = new URLSearchParams({
    ...parameters,
    api_key: config.apiKey,
    signature: signParameters(parameters, config.apiSecret),
  });

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: destroyData,
    });
    if (!response.ok) return Response.json({ message: "Cloudinary no pudo eliminar la imagen." }, { status: 502 });
    return Response.json({ deleted: true });
  } catch {
    return Response.json({ message: "No fue posible conectar con Cloudinary." }, { status: 502 });
  }
}
