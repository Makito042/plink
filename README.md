# PharmaLink E-Commerce Platform

A modern healthcare e-commerce solution connecting pharmacies, vendors, and customers.

## Features

- Multi-role Authentication (Admin/Vendor/Customer)
- Vendor Store Management
- Pharmaceutical Product Catalog with Advanced Image Management
- Real-time Analytics Dashboard
- Shopping Cart & Order Management
- Secure Payment Processing

### Image Upload Features
- Multi-image upload support (up to 5 images per product)
- Automatic image compression and optimization
- Support for JPEG, PNG, and WebP formats
- Image validation and security checks
- Image metadata extraction and storage
- Image reordering capabilities
- Secure file handling

## Quick Start

### Prerequisites
- Node.js (v16+)
- npm (v8+)
- MongoDB account
- Sharp image processing library (installed automatically)

### Installation
```bash
# Clone repository
git clone [repository-url]
cd pharmalink

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Update .env with your values

# Start development servers
npm run dev:all
```

## Project Structure

```
pharmalink/
├── src/               # Frontend source
│   ├── components/    # React components
│   ├── pages/        # Page components
│   └── services/     # API services
├── server/           # Backend source
│   ├── routes/       # API routes
│   ├── models/       # Database models
│   └── middleware/   # Express middleware
└── public/           # Static assets
```

## User Roles

### Customer
- Browse products
- Place orders
- Track deliveries
- View order history

### Vendor
- Manage product listings with advanced image capabilities
  * Upload multiple product images
  * Reorder product images
  * Delete individual images
  * View image metadata and optimization details
- Track inventory
- Process orders
- View sales analytics

### Admin
- Monitor platform
- Manage users
- View system analytics
- Handle support

## Security Features

- JWT Authentication
- Role-based Access
- Secure Password Handling
- Data Encryption

## Deployment

- Frontend: Render (Static Site)
- Backend: Render (Node.js)
- Database: MongoDB Atlas

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT License - see LICENSE.md

## Support

For support, email support@pharmalink.com