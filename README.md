# PharmaLink - Online Pharmacy Platform

PharmaLink is a modern e-commerce platform for pharmaceutical products based in Kigali, Rwanda. The platform provides a seamless experience for customers to purchase healthcare products online.

## Features

### Product Management
- **Product Categories**
  - Vitamins & Supplements
  - Personal Care Products
  - Over-the-Counter Medications
  - Medical Devices
- Product Search and Filtering
- Detailed Product Information
- Price Range Filtering

### User Management
- **Authentication**
  - Secure User Registration
  - Login/Logout Functionality
  - Password Hashing
  - JWT-based Authentication
- **User Dashboard**
  - Personal Information Display
  - Order History
  - Order Status Tracking
  - Total Spending Analytics

### Shopping Experience
- **Shopping Cart**
  - Real-time Cart Updates
  - Quantity Management
  - Price Calculations
- **Checkout Process**
  - Multi-step Checkout
  - Shipping Information
  - Payment Processing
  - Order Confirmation

### Order Management
- **Order Tracking**
  - User-specific Order History
  - Order Status Updates
  - Order Details View
- **Order Analytics**
  - Total Orders Count
  - Active Orders Tracking
  - Total Spending Calculation

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for Build Tooling
- Tailwind CSS for Styling
- React Router v6 for Navigation
- Lucide Icons for UI Elements

### State Management
- React Context API
- Custom Hooks for Business Logic
- Local Storage for Data Persistence

### Authentication
- JWT Token-based Auth
- Secure Password Handling
- Protected Routes

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Header.tsx    # Navigation and user menu
│   ├── Footer.tsx    # Site footer
│   └── styles.css    # Component-specific styles
├── context/          # React Context providers
│   ├── AuthContext.tsx    # User authentication state
│   ├── CartContext.tsx    # Shopping cart management
│   └── OrderContext.tsx   # Order management
├── pages/            # Page components
│   ├── Dashboard.tsx      # User dashboard
│   ├── Checkout.tsx      # Checkout process
│   └── ...
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── main.tsx         # Application entry point
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/makito042/pharmalink.git
cd pharmalink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. For production build:
```bash
npm run build
npm run preview
```

## Development Guidelines

### State Management
- Use React Context for global state
- Implement custom hooks for complex logic
- Keep component state local when possible

### Component Structure
- Use TypeScript interfaces for props
- Implement error boundaries
- Follow React best practices

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Maintain consistent color scheme

## Environment Setup

### Requirements
- Node.js 16+
- npm 7+
- Modern web browser

### Development Tools
- VS Code (recommended)
- React Developer Tools
- TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

## License

MIT License

## Contact

For inquiries, please contact:
- Email: contact@pharmalink.rw
- Phone: +250 123 456 789
- Address: KG 123 St, Kigali, Rwanda

## Changelog

### Latest Updates (v1.1.0)
- Added user-specific order management
- Implemented persistent order storage
- Enhanced dashboard with order analytics
- Added profile dropdown with hover delay
- Improved checkout process with order creation