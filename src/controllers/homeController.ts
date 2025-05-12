import { Request, Response } from 'express';
import Category from '../models/categoryModel';
import Blog from '../models/blogModel';

// Home page with featured content
export const getHomePage = async (req: Request, res: Response) => {
  try {
    // Fetch featured categories
    const featuredCategories = await Category.find({ featured: true }).limit(3);
    
    // Fetch featured blogs
    const featuredBlogs = await Blog.find({ featured: true })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(6);
    
    res.render('index', {
      title: 'Home',
      featuredCategories,
      featuredBlogs
    });
  } catch (error: any) {
    console.error('Error fetching home page data:', error);
    res.render('index', {
      title: 'Home',
      featuredCategories: [],
      featuredBlogs: [],
      error: 'Failed to load content'
    });
  }
};

// Blog list page
export const getBlogListPage = async (req: Request, res: Response) => {
  try {
    // Pagination
    const pageSize = 9;
    const page = Number(req.query.page) || 1;
    
    const count = await Blog.countDocuments({});
    
    const blogs = await Blog.find({})
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.render('blogs', {
      title: 'All Blogs',
      blogs,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    res.render('blogs', {
      title: 'All Blogs',
      blogs: [],
      page: 1,
      pages: 0,
      count: 0,
      error: 'Failed to load blogs'
    });
  }
};

// Blog detail page
export const getBlogDetailPage = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('author', 'name');
    
    if (!blog) {
      return res.status(404).render('error', {
        title: 'Blog Not Found',
        error: 'The blog post you are looking for does not exist'
      });
    }
    
    // Get related blogs (same category, excluding current blog)
    const relatedBlogs = await Blog.find({
      category: blog.category._id,
      _id: { $ne: blog._id }
    })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .limit(3);
    
    res.render('blog-detail', {
      title: blog.title,
      blog,
      relatedBlogs
    });
  } catch (error: any) {
    console.error('Error fetching blog detail:', error);
    res.status(500).render('error', {
      title: 'Error',
      error: 'Failed to load blog post'
    });
  }
};

// Category blogs page
export const getCategoryBlogsPage = async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).render('error', {
        title: 'Category Not Found',
        error: 'The category you are looking for does not exist'
      });
    }
    
    // Pagination
    const pageSize = 9;
    const page = Number(req.query.page) || 1;
    
    const count = await Blog.countDocuments({ category: category._id });
    
    const blogs = await Blog.find({ category: category._id })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.render('category', {
      title: category.name,
      category,
      blogs,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error: any) {
    console.error('Error fetching category blogs:', error);
    res.status(500).render('error', {
      title: 'Error',
      error: 'Failed to load category'
    });
  }
}; 