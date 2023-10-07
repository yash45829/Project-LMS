import path from "path";
import multer from "multer";

// not completed
const upload = multer({
  // dest : "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (_req, file, cb) => {
    let ext = path.extname(file.originalname);

    if (
      ext !== ".jpg" &&
      ext !== ".webp" &&
      ext !== ".jpeg" &&
      ext !== ".mp4" &&
      ext !== ".png"
    ) {
      cb(
        res.status(400).json({
          success: false,
          message: "failed , upload again",
        }),
        false
      );
      return;
    }

    cb(null, true);
  },
});

export default upload;
