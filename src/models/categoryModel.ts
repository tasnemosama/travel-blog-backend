import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  coverImage: string;
  thumbnail: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICategory>('Category', categorySchema); 