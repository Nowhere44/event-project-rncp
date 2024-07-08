// @/utils/fileUpload.ts

import fs from 'fs';
import path from 'path';

export async function uploadProfilePicture(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    // Écrire le fichier
    fs.writeFileSync(filePath, buffer);

    // Retourner le chemin relatif du fichier
    return `/uploads/${fileName}`;
}