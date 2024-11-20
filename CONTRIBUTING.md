# Contributing to PharmaLink

Thank you for your interest in contributing to PharmaLink! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Local Development Environment
1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/pharmalink.git
```

3. Install dependencies:
```bash
cd pharmalink
npm install
```

4. Create a branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define interfaces for component props
- Use proper type annotations
- Avoid using `any` type

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Implement error boundaries where necessary

### State Management
- Use React Context for global state
- Keep state as local as possible
- Use custom hooks for complex logic
- Document state management decisions

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use the project's color scheme

## Project Structure

### Components
- Place reusable components in `src/components/`
- Create component-specific styles in the same directory
- Use index files for cleaner imports

### Context
- Place context providers in `src/context/`
- Include proper TypeScript interfaces
- Document context usage

### Pages
- Place page components in `src/pages/`
- Keep pages focused on layout and composition
- Move complex logic to custom hooks

### Types
- Place shared types in `src/types/`
- Export types from index files
- Use descriptive names

## Testing Guidelines

### Unit Tests
- Write tests for utility functions
- Test custom hooks
- Use React Testing Library
- Focus on user behavior

### Component Tests
- Test component rendering
- Test user interactions
- Test error states
- Mock context providers when necessary

## Git Workflow

### Branches
- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`

### Commits
- Use clear, descriptive commit messages
- Follow conventional commits format
- Reference issues in commits

### Pull Requests
1. Update your feature branch with latest changes:
```bash
git fetch origin
git rebase origin/develop
```

2. Push your changes:
```bash
git push origin feature/your-feature-name
```

3. Create a Pull Request:
- Use a clear title and description
- Reference related issues
- Add appropriate labels
- Request reviews from maintainers

## Documentation

### Code Documentation
- Document complex functions
- Add JSDoc comments for public APIs
- Include usage examples
- Document context providers

### README Updates
- Update for new features
- Keep installation steps current
- Document configuration changes
- Update troubleshooting guide

## Review Process

### Code Review
- All changes require review
- Address review comments
- Keep discussions professional
- Be open to feedback

### Checklist
- [ ] Code follows style guidelines
- [ ] Tests are passing
- [ ] Documentation is updated
- [ ] Changes are rebased on latest develop
- [ ] No unnecessary dependencies added

## Release Process

### Version Numbers
- Follow semantic versioning
- Document breaking changes
- Update changelog

### Release Steps
1. Merge to develop
2. Create release branch
3. Update version numbers
4. Create release notes
5. Merge to main

## Getting Help

### Resources
- Project documentation
- React documentation
- TypeScript documentation
- Tailwind CSS documentation

### Contact
- GitHub issues for bug reports
- Discussions for questions
- Email for security issues

Remember to:
- Be respectful and professional
- Follow the code of conduct
- Help others when possible
- Keep learning and improving

Thank you for contributing to PharmaLink!
