import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    metadata: {
      width: Number,
      height: Number,
      format: String,
      size: Number,
      hasAlpha: Boolean,
      isAnimated: Boolean
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  specifications: [{
    name: String,
    value: String
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'outOfStock', 'discontinued'],
    default: 'draft'
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

export default Product;
