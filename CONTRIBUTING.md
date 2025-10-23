# Contributing to CosyPOS

First off, thank you for considering contributing to CosyPOS! 🎉

It's people like you that make CosyPOS such a great tool. We welcome contributions from everyone, whether you're fixing a typo, adding a feature, or reporting a bug.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Be respectful and inclusive
- Exercise empathy and kindness
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show courtesy and respect towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Template for Bug Reports:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node Version: [e.g. 22.16.0]
- App Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Features

We love to receive feature suggestions! Before creating feature requests, please check existing issues and discussions.

**Template for Feature Requests:**

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding guidelines
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages** following our commit message guidelines
6. **Submit a pull request** with a clear description

**Pull Request Checklist:**

- [ ] My code follows the project's coding style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Development Setup

### Prerequisites

- Node.js (v22.16.0+)
- PostgreSQL (v14+)
- Git

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/cosypos.git
   cd cosypos/cosypos-clean
   ```

2. **Install backend dependencies**
   ```bash
   cd backend-deploy
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend-deploy
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cd ../backend-deploy
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Frontend
   cd ../frontend-deploy
   cp .env.example .env
   # Edit .env with your backend URL
   ```

5. **Set up the database**
   ```bash
   cd ../backend-deploy
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend-deploy
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend-deploy
   npm run dev
   ```

## Coding Guidelines

### JavaScript/React

- Use **ES6+** syntax
- Use **functional components** with hooks (no class components)
- Use **async/await** instead of promises where possible
- Keep components **small and focused** (single responsibility)
- Use **meaningful variable names** (no single letters except in loops)
- Add **comments** for complex logic

### Naming Conventions

- **Variables & Functions:** `camelCase`
  ```javascript
  const userName = 'John';
  function getUserData() { }
  ```

- **Components:** `PascalCase`
  ```javascript
  function UserProfile() { }
  ```

- **Constants:** `UPPER_SNAKE_CASE`
  ```javascript
  const MAX_RETRIES = 3;
  const API_BASE_URL = 'https://api.example.com';
  ```

- **Files:**
  - Components: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
  - Utilities: `camelCase.js` (e.g., `apiClient.js`)

### Code Structure

```javascript
// 1. Imports (external libraries first, then internal)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

// 2. Constants
const DEFAULT_TIMEOUT = 5000;

// 3. Component
function MyComponent({ prop1, prop2 }) {
  // 3a. State declarations
  const [data, setData] = useState(null);
  
  // 3b. Hooks
  const navigate = useNavigate();
  
  // 3c. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3d. Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 3e. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 4. Export
export default MyComponent;
```

### CSS/Styling

- Use **inline styles** for component-specific styling (as per project pattern)
- Keep styles **organized** and **readable**
- Use **consistent colors** from the theme
- Ensure **responsive design** for mobile devices

### Backend Guidelines

- Use **async/await** for database operations
- Always use **try-catch** blocks for error handling
- Validate **input data** before processing
- Use **middleware** for authentication and authorization
- Keep routes **thin** - move logic to separate functions
- Add **JSDoc comments** for complex functions

```javascript
/**
 * Creates a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with order data
 */
async function createOrder(req, res) {
  try {
    // Function logic
  } catch (error) {
    // Error handling
  }
}
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
feat(menu): add search functionality to menu items

# Bug fix
fix(orders): resolve order status update issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(auth): simplify JWT token validation logic

# Performance
perf(inventory): optimize inventory query performance
```

### Commit Message Guidelines

- Use the **present tense** ("Add feature" not "Added feature")
- Use the **imperative mood** ("Move cursor to..." not "Moves cursor to...")
- Keep the **first line under 72 characters**
- Reference **issues and pull requests** when relevant
- Add **detailed description** in the body for complex changes

## Testing

### Running Tests

```bash
# Backend tests
cd backend-deploy
npm test

# Frontend tests
cd frontend-deploy
npm test

# Run tests in watch mode
npm test -- --watch
```

### Writing Tests

- Write tests for **all new features**
- Write tests for **bug fixes** to prevent regressions
- Aim for **high test coverage** (>80%)
- Use **descriptive test names**

```javascript
// Good test names
describe('UserAuthentication', () => {
  it('should return 401 when password is incorrect', () => {
    // Test logic
  });
  
  it('should create a new user with valid credentials', () => {
    // Test logic
  });
});
```

## Project-Specific Guidelines

### State Management

- Use **React Context** for global state (user, auth)
- Use **useState** for local component state
- Use **useMemo** for expensive calculations
- Use **useCallback** for function references in dependencies

### API Communication

- Use the centralized `apiClient` utility
- Handle errors gracefully with try-catch
- Show user feedback with toast notifications
- Implement loading states for async operations

### Performance

- Use **lazy loading** for routes
- Optimize images before uploading
- Implement **pagination** for large lists
- Use **memoization** where appropriate
- Avoid unnecessary re-renders

### Accessibility

- Use **semantic HTML** elements
- Add **alt text** for images
- Ensure **keyboard navigation** works
- Maintain proper **color contrast**
- Add **ARIA labels** where needed

## Review Process

### For Contributors

1. **Self-review** your code before submitting
2. Ensure all **tests pass**
3. Update **documentation** if needed
4. Be **responsive** to feedback
5. **Test** your changes in different browsers/devices

### For Reviewers

1. Be **constructive** and **respectful**
2. Test the changes **locally**
3. Check for **code quality** and **standards compliance**
4. Verify **documentation** is updated
5. Approve or request changes with **clear feedback**

## Getting Help

- 📖 **Documentation:** Check the [README](README.md) and [Wiki](https://github.com/yourusername/cosypos/wiki)
- 💬 **Discussions:** Use [GitHub Discussions](https://github.com/yourusername/cosypos/discussions) for questions
- 🐛 **Issues:** Report bugs using [GitHub Issues](https://github.com/yourusername/cosypos/issues)

## Recognition

Contributors are recognized in:
- README.md Contributors section
- Release notes for significant contributions
- Special thanks in project documentation

## Questions?

Don't hesitate to ask questions! We're here to help. You can:
- Open a [Discussion](https://github.com/yourusername/cosypos/discussions)
- Comment on relevant issues
- Reach out to maintainers

---

**Thank you for contributing to CosyPOS! 🎉**

Every contribution, no matter how small, is valuable and appreciated. Together, we're building something amazing!



