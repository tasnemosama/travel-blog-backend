# Travel Blog Backend

A Node.js backend API for a travel blog content management system.

## Features

- User authentication and authorization
- Content management for blog posts
- File uploads for images
- RESTful API
- MongoDB database integration

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hesham1221/travel-blog-backend.git
cd travel-blog-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

## Usage

### Development

Run the development server with hot reload:
```bash
npm run dev
```

### Build

Compile the TypeScript code:
```bash
npm run build
```

### Production

Start the production server:
```bash
npm start
```

### Database Seeding

Seed the database with initial data:
```bash
npm run seed
```

## Project Structure

```
travel-blog-backend/
├── src/
│   ├── config/      # Configuration files (database, etc.)
│   ├── controllers/ # Route controllers
│   ├── middleware/  # Custom middleware
│   ├── models/      # Database models
│   ├── routes/      # API routes
│   ├── types/       # TypeScript type definitions
│   ├── views/       # EJS templates
│   ├── app.ts       # Express app setup
│   └── index.ts     # Application entry point
├── uploads/         # File uploads directory
└── dist/            # Compiled JavaScript output
```


## License

ISC 