# Contributing to The Ice Cream Man

Thank you for your interest in contributing to The Ice Cream Man! This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Report inappropriate behavior to the maintainers

---

## Getting Started

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally: `git clone https://github.com/YOUR_USERNAME/the-ice-cream-man.git`
3. Add upstream remote: `git remote add upstream https://github.com/Mgfromthe503/the-ice-cream-man.git`

### Set Up Development Environment

Follow the instructions in the README to install dependencies and set up your development environment.

### Create a Feature Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names that clearly indicate the feature or fix.

---

## Development Guidelines

### Code Style

The project uses ESLint and Prettier for code formatting. Before committing, ensure your code follows the project's style:

```bash
pnpm lint
pnpm format
```

### TypeScript

All code should be written in TypeScript with proper type annotations. Avoid using `any` types unless absolutely necessary.

### Component Structure

When creating new components, follow this structure:

```typescript
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  const colors = useColors();

  return (
    <Pressable onPress={onPress}>
      <View className="p-4">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
      </View>
    </Pressable>
  );
}
```

### Naming Conventions

- **Components:** PascalCase (e.g., `MyComponent.tsx`)
- **Hooks:** camelCase starting with `use` (e.g., `useAuth.ts`)
- **Files:** kebab-case for utilities (e.g., `my-utility.ts`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Comments and Documentation

Write clear comments for complex logic. Use JSDoc for function documentation:

```typescript
/**
 * Fetches ice cream requests for the current driver.
 * @param driverId - The unique identifier of the driver
 * @returns Promise resolving to an array of requests
 */
async function fetchDriverRequests(driverId: string): Promise<Request[]> {
  // Implementation
}
```

---

## Testing

### Writing Tests

All new features should include tests. Use Vitest for unit tests:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateEarnings } from '@/lib/earnings';

describe('calculateEarnings', () => {
  it('should calculate earnings correctly', () => {
    const earnings = calculateEarnings(10, 5); // 10 orders, $5 per order
    expect(earnings).toBe(50);
  });
});
```

### Running Tests

Run all tests with `pnpm test`. For watch mode during development:

```bash
pnpm test:watch
```

Ensure all tests pass before submitting a pull request.

---

## Commit Messages

Write clear, descriptive commit messages following the Conventional Commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, missing semicolons, etc.)
- `refactor:` Code refactoring without feature changes
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Examples

```
feat(auth): add OAuth login support
fix(map): resolve location tracking lag on Android
docs: update installation instructions
test(requests): add test for request acceptance flow
```

---

## Pull Request Process

### Before Submitting

1. Update your branch with the latest upstream changes: `git fetch upstream && git rebase upstream/main`
2. Run tests: `pnpm test`
3. Run linter: `pnpm lint`
4. Format code: `pnpm format`
5. Build the project: `pnpm build`

### Creating a Pull Request

1. Push your branch to your fork: `git push origin feature/your-feature-name`
2. Go to the original repository and click "New Pull Request"
3. Select your branch and fill in the PR template
4. Provide a clear description of your changes
5. Link related issues if applicable

### PR Title Format

Follow the same format as commit messages:

```
feat(component): add new ice cream flavor selector
fix(api): resolve request timeout issue
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Related Issues
Closes #123

## Changes
- Change 1
- Change 2

## Testing
How to test these changes.

## Screenshots (if applicable)
Add screenshots of UI changes.
```

---

## Code Review

### What to Expect

- Maintainers will review your PR within 2-3 business days
- Feedback will be constructive and focused on code quality
- Multiple rounds of review may be necessary

### Addressing Feedback

- Make requested changes in new commits
- Avoid force-pushing unless asked
- Respond to comments explaining your approach
- Re-request review after making changes

---

## Documentation

### Updating Documentation

When adding new features, update relevant documentation:

- Update README.md if adding major features
- Add JSDoc comments to new functions
- Update API documentation if adding endpoints
- Add examples for complex features

### Documentation Standards

- Use clear, concise language
- Include code examples
- Explain the "why" not just the "what"
- Keep documentation up-to-date with code changes

---

## Reporting Issues

### Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs if applicable
- Device and OS information

### Feature Requests

When suggesting features, include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if applicable)
- Examples or mockups

---

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the `question` label
- Contact the maintainer: mindy.gaines1@gmail.com
- Check existing issues and discussions

---

## Recognition

Contributors will be recognized in:

- The project README
- Release notes for their contributions
- GitHub contributors page

Thank you for contributing to The Ice Cream Man! 🍦
