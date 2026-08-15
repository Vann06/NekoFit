type CloudinaryUploadResult = {
  publicId: string;
  originalUrl: string;
  displayUrl: string;
};

export async function uploadWardrobeImage(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/wardrobe-images", { method: "POST", body: formData });
  const payload = await response.json() as CloudinaryUploadResult & { message?: string };

  if (!response.ok) throw new Error(payload.message ?? "No fue posible subir la fotografía.");
  return payload;
}

export async function deleteWardrobeImage(publicId: string) {
  const response = await fetch("/api/wardrobe-images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) throw new Error("No fue posible eliminar la imagen de Cloudinary.");
}
