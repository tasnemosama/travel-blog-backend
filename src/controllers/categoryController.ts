import { Request, Response } from 'express';
import Category from '../models/categoryModel';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, featured } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    
    // Check if category with the same slug already exists
    const categoryExists = await Category.findOne({ slug });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Create files path
    let coverImage = ""
    let thumbnail = ""
    if(!Array.isArray(req.files)){
      coverImage = req.files?.coverImage ? req.files.coverImage[0].path : '';
      thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : '';
    }
    
    if (!coverImage || !thumbnail) {
      return res.status(400).json({ message: 'Please upload both cover image and thumbnail' });
    }
    
    const category = await Category.create({
      name,
      slug,
      description,
      coverImage,
      thumbnail,
      featured: featured || false,
    });
    
    res.status(201).json(category);
  } catch (error:any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ featured: true });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error:any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error:any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, featured } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update fields if provided
    if (name) {
      category.name = name;
      // Generate new slug if name changed
      category.slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    }
    
    if (description !== undefined) {
      category.description = description;
    }
    
    if (featured !== undefined) {
      category.featured = featured;
    }
    
    // Update images if provided
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.coverImage) {
        category.coverImage = req.files.coverImage[0].path;
      }
      
      if (req.files.thumbnail) {
        category.thumbnail = req.files.thumbnail[0].path;
      }
    }
    
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error:any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.remove();
    
    res.json({ message: 'Category removed' });
  } catch (error:any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 