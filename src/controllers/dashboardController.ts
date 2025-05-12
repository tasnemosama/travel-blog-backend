import { Request, Response } from 'express';
import Category from '../models/categoryModel';
import Blog from '../models/blogModel';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';

// Authentication
export const getLogin = (req: Request, res: Response) => {
  res.render('dashboard/login', {
    title: 'Dashboard Login',
    error: null
  });
};

export const postLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (!user.isAdmin) {
        return res.render('dashboard/login', {
          title: 'Dashboard Login',
          error: 'Not authorized as admin'
        });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      };

      res.redirect('/dashboard');
    } else {
      res.render('dashboard/login', {
        title: 'Dashboard Login',
        error: 'Invalid email or password'
      });
    }
  } catch (error: any) {
    res.render('dashboard/login', {
      title: 'Dashboard Login',
      error: error.message || 'Server error'
    });
  }
};

export const getLogout = (req: Request, res: Response) => {
  res.clearCookie('token');
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/dashboard/login');
  });
};

// Dashboard Home
export const getDashboardHome = async (req: Request, res: Response) => {
  try {
    const categoriesCount = await Category.countDocuments();
    const blogsCount = await Blog.countDocuments();
    const featuredBlogs = await Blog.countDocuments({ featured: true });
    const featuredCategories = await Category.countDocuments({ featured: true });

    res.render('dashboard/index', {
      title: 'Dashboard',
      stats: {
        categoriesCount,
        blogsCount,
        featuredBlogs,
        featuredCategories
      },
      user: req.session.user
    });
  } catch (error: any) {
    res.render('dashboard/index', {
      title: 'Dashboard',
      error: error.message || 'Error loading dashboard',
      stats: {
        categoriesCount: 0,
        blogsCount: 0,
        featuredBlogs: 0,
        featuredCategories: 0
      },
      user: req.session.user
    });
  }
};

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    
    res.render('dashboard/categories/index', {
      title: 'Manage Categories',
      categories,
      user: req.session.user,
      error: null
    });
  } catch (error: any) {
    res.render('dashboard/categories/index', {
      title: 'Manage Categories',
      categories: [],
      user: req.session.user,
      error: error.message || 'Error loading categories'
    });
  }
};

export const getCreateCategory = (req: Request, res: Response) => {
  res.render('dashboard/categories/create', {
    title: 'Create Category',
    user: req.session.user,
    error: null
  });
};

export const postCreateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, featured } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    
    // Check if category with the same slug already exists
    const categoryExists = await Category.findOne({ slug });
    
    if (categoryExists) {
      return res.render('dashboard/categories/create', {
        title: 'Create Category',
        user: req.session.user,
        error: 'Category with this name already exists',
        formData: req.body
      });
    }
    
    // Create files path
    let coverImage = ""
    let thumbnail = ""
    if(!Array.isArray(req.files)){
      coverImage = req.files?.coverImage ? req.files.coverImage[0].path : '';
      thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : '';
    }
    
    if (!coverImage || !thumbnail) {
      return res.render('dashboard/categories/create', {
        title: 'Create Category',
        user: req.session.user,
        error: 'Please upload both cover image and thumbnail',
        formData: req.body
      });
    }
    
    await Category.create({
      name,
      slug,
      description,
      coverImage,
      thumbnail,
      featured: featured === 'on' || featured === true
    });
    
    res.redirect('/dashboard/categories');
  } catch (error: any) {
    res.render('dashboard/categories/create', {
      title: 'Create Category',
      user: req.session.user,
      error: error.message || 'Error creating category',
      formData: req.body
    });
  }
};

export const getEditCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.redirect('/dashboard/categories');
    }
    
    res.render('dashboard/categories/edit', {
      title: 'Edit Category',
      user: req.session.user,
      category,
      error: null
    });
  } catch (error: any) {
    res.redirect('/dashboard/categories');
  }
};

export const putEditCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, featured } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.redirect('/dashboard/categories');
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
    
    category.featured = featured === 'on' || featured === true;
    
    // Update images if provided
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.coverImage) {
        category.coverImage = req.files.coverImage[0].path;
      }
      
      if (req.files.thumbnail) {
        category.thumbnail = req.files.thumbnail[0].path;
      }
    }
    
    await category.save();
    
    res.redirect('/dashboard/categories');
  } catch (error: any) {
    const category = await Category.findById(req.params.id);
    
    res.render('dashboard/categories/edit', {
      title: 'Edit Category',
      user: req.session.user,
      category,
      error: error.message || 'Error updating category'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (category) {
      await Category.deleteOne({ _id: category._id });
    }
    
    res.redirect('/dashboard/categories');
  } catch (error: any) {
    res.redirect('/dashboard/categories');
  }
};

// Blogs
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({})
      .populate('category', 'name')
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    
    res.render('dashboard/blogs/index', {
      title: 'Manage Blogs',
      blogs,
      user: req.session.user,
      error: null
    });
  } catch (error: any) {
    res.render('dashboard/blogs/index', {
      title: 'Manage Blogs',
      blogs: [],
      user: req.session.user,
      error: error.message || 'Error loading blogs'
    });
  }
};

export const getCreateBlog = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    
    res.render('dashboard/blogs/create', {
      title: 'Create Blog',
      categories,
      user: req.session.user,
      error: null
    });
  } catch (error: any) {
    res.render('dashboard/blogs/create', {
      title: 'Create Blog',
      categories: [],
      user: req.session.user,
      error: error.message || 'Error loading categories'
    });
  }
};

export const postCreateBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, category, featured } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    
    // Check if blog with the same slug already exists
    const blogExists = await Blog.findOne({ slug });
    
    if (blogExists) {
      const categories = await Category.find({});
      
      return res.render('dashboard/blogs/create', {
        title: 'Create Blog',
        categories,
        user: req.session.user,
        error: 'A blog with this title already exists',
        formData: req.body
      });
    }
    
    // Check if category exists
    const categoryExists = await Category.findById(category);
    
    if (!categoryExists) {
      const categories = await Category.find({});
      
      return res.render('dashboard/blogs/create', {
        title: 'Create Blog',
        categories,
        user: req.session.user,
        error: 'Selected category does not exist',
        formData: req.body
      });
    }
    
    // Create files path
    let coverImage = ""
    let thumbnail = ""
    if(!Array.isArray(req.files)){
      coverImage = req.files?.coverImage ? req.files.coverImage[0].path : '';
      thumbnail = req.files?.thumbnail ? req.files.thumbnail[0].path : '';
    }
    
    if (!coverImage || !thumbnail) {
      const categories = await Category.find({});
      
      return res.render('dashboard/blogs/create', {
        title: 'Create Blog',
        categories,
        user: req.session.user,
        error: 'Please upload both cover image and thumbnail',
        formData: req.body
      });
    }
    
    await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      coverImage,
      thumbnail,
      featured: featured === 'on' || featured === true,
      author: req.user._id
    });
    
    res.redirect('/dashboard/blogs');
  } catch (error: any) {
    const categories = await Category.find({});
    
    res.render('dashboard/blogs/create', {
      title: 'Create Blog',
      categories,
      user: req.session.user,
      error: error.message || 'Error creating blog',
      formData: req.body
    });
  }
};

export const getEditBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    const categories = await Category.find({});
    
    if (!blog) {
      return res.redirect('/dashboard/blogs');
    }
    
    res.render('dashboard/blogs/edit', {
      title: 'Edit Blog',
      blog,
      categories,
      user: req.session.user,
      error: null
    });
  } catch (error: any) {
    res.redirect('/dashboard/blogs');
  }
};

export const putEditBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, category, featured } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.redirect('/dashboard/blogs');
    }
    
    // Check if category exists
    if (category) {
      const categoryExists = await Category.findById(category);
      
      if (!categoryExists) {
        const categories = await Category.find({});
        
        return res.render('dashboard/blogs/edit', {
          title: 'Edit Blog',
          blog,
          categories,
          user: req.session.user,
          error: 'Selected category does not exist'
        });
      }
      
      blog.category = category;
    }
    
    // Update fields if provided
    if (title) {
      blog.title = title;
      // Generate new slug if title changed
      blog.slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    }
    
    if (content) {
      blog.content = content;
    }
    
    if (excerpt) {
      blog.excerpt = excerpt;
    }
    
    blog.featured = featured === 'on' || featured === true;
    
    // Update images if provided
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.coverImage) {
        blog.coverImage = req.files.coverImage[0].path;
      }
      
      if (req.files.thumbnail) {
        blog.thumbnail = req.files.thumbnail[0].path;
      }
    }
    
    await blog.save();
    
    res.redirect('/dashboard/blogs');
  } catch (error: any) {
    const blog = await Blog.findById(req.params.id);
    const categories = await Category.find({});
    
    res.render('dashboard/blogs/edit', {
      title: 'Edit Blog',
      blog,
      categories,
      user: req.session.user,
      error: error.message || 'Error updating blog'
    });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (blog) {
      await Blog.deleteOne({ _id: blog._id });
    }
    
    res.redirect('/dashboard/blogs');
  } catch (error: any) {
    res.redirect('/dashboard/blogs');
  }
}; 