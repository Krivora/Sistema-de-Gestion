import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadLogo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const clientId = req.params.id; // viene de /clients/:id/logo
      const dir = `uploads/clients/${clientId}`;

      // Crear carpeta si no existe
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `logo${ext}`; // Nombre fijo o puedes usar timestamp

      cb(null, fileName);
    },
  }),
}).single("file");
