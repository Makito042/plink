import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Compresses and optimizes an image file
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save compressed image
 * @param {Object} options - Compression options
 * @returns {Promise<void>}
 */
export async function compressImage(inputPath, outputPath, options = {}) {
  const {
    quality = 80,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg'
  } = options;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if image is larger than max dimensions
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert and compress
    switch (format) {
      case 'jpeg':
      case 'jpg':
        await image
          .jpeg({ quality, mozjpeg: true })
          .toFile(outputPath);
        break;
      case 'png':
        await image
          .png({ quality, compressionLevel: 9 })
          .toFile(outputPath);
        break;
      case 'webp':
        await image
          .webp({ quality })
          .toFile(outputPath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Delete original file after successful compression
    await fs.promises.unlink(inputPath);
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
}

/**
 * Validates image dimensions and size
 * @param {string} imagePath - Path to image file
 * @param {Object} limits - Validation limits
 * @returns {Promise<boolean>}
 */
export async function validateImage(imagePath, limits = {}) {
  const {
    maxWidth = 5000,
    maxHeight = 5000,
    minWidth = 100,
    minHeight = 100,
    maxSizeInBytes = 5 * 1024 * 1024 // 5MB
  } = limits;

  try {
    // Check file size
    const stats = await fs.promises.stat(imagePath);
    if (stats.size > maxSizeInBytes) {
      throw new Error(`Image size exceeds ${maxSizeInBytes / (1024 * 1024)}MB limit`);
    }

    // Check dimensions
    const metadata = await sharp(imagePath).metadata();
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      throw new Error(`Image dimensions exceed ${maxWidth}x${maxHeight} limit`);
    }
    if (metadata.width < minWidth || metadata.height < minHeight) {
      throw new Error(`Image dimensions below ${minWidth}x${minHeight} minimum`);
    }

    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    throw error;
  }
}

/**
 * Extracts metadata from an image
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} Image metadata
 */
export async function getImageMetadata(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: (await fs.promises.stat(imagePath)).size,
      hasAlpha: metadata.hasAlpha,
      isAnimated: metadata.pages > 1
    };
  } catch (error) {
    console.error('Error extracting image metadata:', error);
    throw error;
  }
}
