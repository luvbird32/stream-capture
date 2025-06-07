
# Contributing to Screen Recorder

Thank you for your interest in contributing to Screen Recorder! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Issue Reporting](#issue-reporting)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser with screen capture API support
- Git for version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screen-recorder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── CaptureMode.tsx  # Main recording interface
│   ├── RecordingControls.tsx
│   ├── RecordingPreview.tsx
│   ├── RecordingSettings.tsx
│   ├── VideoEditor.tsx
│   └── ProjectManager.tsx
├── hooks/               # Custom React hooks
│   ├── useRecording.ts  # Recording functionality
│   ├── useRecordingManager.ts
│   └── usePictureInPicture.ts
├── services/            # Business logic and API services
│   ├── RecordingService.ts
│   ├── ChromeExtensionService.ts
│   └── mediaRecorderManager.ts
├── pages/               # Route components
└── lib/                 # Utilities and configurations
```

## Development Guidelines

### Architecture Principles

1. **Component Separation**: Keep components focused and single-purpose
2. **Hook Pattern**: Extract reusable logic into custom hooks
3. **Service Layer**: Business logic should be in service files
4. **Type Safety**: Use TypeScript throughout the codebase

### Key Technologies

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **MediaRecorder API** for screen recording
- **React Router** for navigation

### Component Guidelines

1. **Functional Components**: Use function components with hooks
2. **Props Interface**: Define clear TypeScript interfaces for props
3. **Event Handling**: Use descriptive handler names (e.g., `handleStartRecording`)
4. **State Management**: Keep state close to where it's used

### Hook Guidelines

1. **Custom Hooks**: Extract complex logic into reusable hooks
2. **Dependencies**: Properly list dependencies in useEffect
3. **Cleanup**: Always clean up resources (streams, timers, etc.)

## Submitting Changes

### Pull Request Process

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Test your changes** thoroughly
   - Test recording functionality
   - Test in different browsers
   - Verify UI responsiveness

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add webcam overlay positioning"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with:
   - Clear description of changes
   - Screenshots/videos for UI changes
   - Test instructions

### Commit Message Format

Use conventional commits format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all component props
- Avoid `any` type usage
- Use meaningful variable and function names

### React Components

```tsx
interface ComponentProps {
  title: string;
  onAction: () => void;
  isActive?: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  isActive = false
}) => {
  return (
    <div className="component-class">
      {/* Component JSX */}
    </div>
  );
};
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use shadcn/ui components when possible
- Keep custom CSS minimal

## Testing

### Manual Testing Checklist

- [ ] Recording starts and stops correctly
- [ ] Audio recording works (when enabled)
- [ ] Webcam overlay functions properly
- [ ] Video playback works in editor
- [ ] Export functionality works
- [ ] UI is responsive across screen sizes
- [ ] Browser permissions are handled gracefully

### Cross-Browser Testing

Test in major browsers:
- Chrome/Chromium
- Firefox
- Safari (if possible)
- Edge

## Issue Reporting

### Bug Reports

Include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots/recordings

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation approach
- Mockups or examples (if applicable)

## Performance Considerations

### Recording Performance

- Be mindful of memory usage during recording
- Properly dispose of media streams
- Handle large video files efficiently
- Consider file size optimization

### UI Performance

- Minimize re-renders
- Use React.memo for expensive components
- Debounce user inputs where appropriate
- Optimize bundle size

## Security Considerations

- Handle user permissions properly
- Validate user inputs
- Be cautious with file handling
- Follow browser security best practices

## Getting Help

- Check existing issues and documentation
- Join discussions in GitHub issues
- Follow the project's code of conduct
- Be respectful and constructive in communications

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Screen Recorder! Your help makes this project better for everyone.
