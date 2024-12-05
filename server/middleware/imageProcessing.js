import { compressImage, validateImage, getImageMetadata } from '../utils/imageProcessing.js';
import path from 'path';

/**
 * Middleware to process uploaded images
 * Validates, compresses, and adds metadata to uploaded images
 */
export const processImages = async (req, res, next) => {
  if (!req.files || !req.files.length) {
    return next();
  }

  try {
    const processedImages = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Validate image
        await validateImage(file.path);

        // Get original metadata
        const metadata = await getImageMetadata(file.path);

        // Generate compressed filename
        const ext = path.extname(file.filename);
        const compressedFilename = `${path.basename(file.filename, ext)}-compressed${ext}`;
        const compressedPath = path.join(process.cwd(), 'uploads', 'products', compressedFilename);

        // Compress image
        await compressImage(file.path, compressedPath, {
          quality: 80,
          format: ext.slice(1) // Remove the dot from extension
        });

        // Update file information
        file.filename = compressedFilename;
        file.path = compressedPath;
        file.metadata = metadata;

        processedImages.push(file);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    // If some images failed but others succeeded
    if (errors.length > 0 && processedImages.length > 0) {
      req.files = processedImages;
      req.fileErrors = errors;
    }
    // If all images failed
    else if (errors.length > 0 && processedImages.length === 0) {
      return res.status(400).json({
        message: 'All image processing failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Image processing middleware error:', error);
    return res.status(500).json({
      message: 'Error processing uploaded images',
      error: error.message
    });
  }
};
