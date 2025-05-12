import { Request, Response } from 'express';
import Blog from '../models/blogModel';
import Category from '../models/categoryModel';


export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, category, featured } = req.body;
    
    const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    
    const blogExists = await Blog.findOne({ slug });
    
    if (blogExists) {
      return res.status(400).json({ message: 'A blog with this title already exists' });
    }
    
    const categoryExists = await Category.findById(category);
    
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    let coverImage = ""
    let thumbnail = ""
    if(!Array.isArray(req.files)){
      coverImage = req.files?.coverImage ? req.files.coverImage[0].path : '';
      thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : '';
    }
    
    if (!coverImage || !thumbnail) {
      return res.status(400).json({ message: 'Please upload both cover image and thumbnail' });
    }
    
    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      coverImage,
      thumbnail,
      featured: featured || false,
      author: req.user._id,
    });
    
    res.status(201).json(blog);
  } catch (error : any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getBlogs = async (req: Request, res: Response) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const count = await Blog.countDocuments({});
    
    const blogs = await Blog.find({})
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      blogs,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getFeaturedBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ featured: true })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(6);
    
    res.json(blogs);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getBlogsByCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const count = await Blog.countDocuments({ category: req.params.categoryId });
    
    const blogs = await Blog.find({ category: req.params.categoryId })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      blogs,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      category,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('author', 'name');
    
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('author', 'name');
    
    if (blog) {
      const relatedBlogs = await Blog.find({
        category: blog.category._id,
        _id: { $ne: blog._id },
      })
        .populate('category', 'name slug')
        .populate('author', 'name')
        .limit(3);
      
      res.json({ blog, relatedBlogs });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, category, featured } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    if (blog.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to update this blog' });
    }
    
    if (category) {
      const categoryExists = await Category.findById(category);
      
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }
    
    if (title) {
      blog.title = title;
      blog.slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    }
    
    if (content) {
      blog.content = content;
    }
    
    if (excerpt) {
      blog.excerpt = excerpt;
    }
    
    if (category) {
      blog.category = category;
    }
    
    if (featured !== undefined) {
      blog.featured = featured;
    }
    
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.coverImage) {
        blog.coverImage = req.files.coverImage[0].path;
      }
      
      if (req.files.thumbnail) {
        blog.thumbnail = req.files.thumbnail[0].path;
      }
    }
    
    const updatedBlog = await blog.save();
    
    res.json(updatedBlog);
  } catch (error:any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    if (blog.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this blog' });
    }
    
    await blog.remove();
    
    res.json({ message: 'Blog removed' });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
