import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    maxSizeInMB = 5,
    allowedFormats = ['jpeg', 'jpg', 'png', 'webp'],
    maxWidth = 3840,
    maxHeight = 2160
  } = limits;

  try {
    const metadata = await sharp(imagePath).metadata();
    
    // Check file size
    const stats = fs.statSync(imagePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      console.warn(`Image exceeds max size of ${maxSizeInMB}MB`);
      return false;
    }

    // Check format
    if (!allowedFormats.includes(metadata.format)) {
      console.warn(`Unsupported image format: ${metadata.format}`);
      return false;
    }

    // Check dimensions
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      console.warn(`Image dimensions exceed ${maxWidth}x${maxHeight}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    return false;
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
    const stats = fs.statSync(imagePath);

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      sizeInBytes: stats.size,
      sizeInMB: stats.size / (1024 * 1024),
      aspectRatio: metadata.width / metadata.height
    };
  } catch (error) {
    console.error('Image metadata extraction error:', error);
    throw error;
  }
}
