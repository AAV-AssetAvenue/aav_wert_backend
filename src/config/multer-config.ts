import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as multer from "multer";
import * as multerS3 from "multer-s3";
import * as dotenv from "dotenv";

dotenv.config();

// ✅ Fix: Correctly initialize the S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const multerOptions = {
  storage: multerS3({
    s3, // ✅ Use S3Client instead of `new S3()`
    bucket: process.env.AWS_S3_BUCKET!,
    // acl: "public-read",
    key: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, `uploads/${filename}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpeg|jpg|png)|application\/pdf/)) {
      return cb(new Error("Only JPEG, JPG, and PNG files are allowed!"), false);
    }
    cb(null, true);
  },
};