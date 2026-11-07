import { ref, uploadBytes } from "firebase/storage";
import { storage } from "./databaseConfig";

// Admin: upload a brand's logo to Brands/{name}.{ext}. The uploadImage Cloud Function then makes the
// file public and adds the Brands doc. Returns the public URL the function gives the file, so the
// brand's coupons can show the logo right away.
export const uploadBrandLogo = async (file: File, name: string) => {
  const ext = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? "";
  const path = `Brands/${name}${ext}`;
  const result = await uploadBytes(ref(storage, path), file, {
    contentType: file.type,
  });
  // Same format as handleBrands in the Cloud Functions.
  return `https://storage.googleapis.com/${result.ref.bucket}/${encodeURIComponent(path)}`;
};
