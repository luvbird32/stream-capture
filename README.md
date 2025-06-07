# Stream Capture Vision 🎥

A powerful Chrome extension for screen recording and video editing built with React, TypeScript, and modern web technologies.

## 🌟 Features

- **Screen Recording**: High-quality screen capture with audio
- **Microphone Integration**: Record system audio with microphone overlay
- **Real-time Controls**: Pause, resume, and stop recordings seamlessly
- **Video Editing**: Built-in editor with trim, volume control, and export options
- **Project Management**: Organize and manage your recordings
- **Chrome Extension**: Native browser integration with desktop capture API
- **Responsive Design**: Works across different screen sizes

## 🏗️ Architecture

This project follows a **modular architecture** with clear separation of concerns:

### 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── AppHeader.tsx    # Main navigation header
│   ├── CaptureMode.tsx  # Screen capture interface
│   ├── VideoEditor.tsx  # Video editing interface
│   ├── ProjectManager.tsx # Project management
│   └── ExtensionDetector.tsx # Chrome extension detection
├── hooks/               # Custom React hooks
│   ├── useRecording.ts  # Recording state management
│   └── useRecordingManager.ts # High-level recording logic
├── services/            # Business logic and APIs
│   ├── RecordingService.ts # Core recording functionality
│   ├── ChromeExtensionService.ts # Extension-specific APIs
│   ├── mediaRecorderManager.ts # MediaRecorder abstraction
│   └── types.ts         # TypeScript type definitions
├── pages/               # Application pages
│   └── Index.tsx        # Main application entry
└── lib/                 # Utility functions
    └── utils.ts         # Helper utilities
```

### 🧩 Module Descriptions

#### **Services Layer**
- `RecordingService`: Core recording logic with stream management
- `ChromeExtensionService`: Chrome extension API integration
- `MediaRecorderManager`: MediaRecorder lifecycle management

#### **Hooks Layer**
- `useRecording`: Low-level recording state and controls
- `useRecordingManager`: High-level recording workflow management

#### **Components Layer**
- Modular UI components with single responsibilities
- Reusable components following React best practices
- Clean separation between presentation and logic

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome browser for extension testing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stream-capture-vision
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### 🔧 Chrome Extension Setup

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🛠️ Development

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Modular Design**: Each module has a single responsibility

### Adding New Features

1. **Create service modules** in `src/services/` for business logic
2. **Create custom hooks** in `src/hooks/` for state management
3. **Create components** in `src/components/` for UI
4. **Update types** in `src/services/types.ts` for TypeScript support

### Example: Adding a New Recording Format

```typescript
// 1. Update types
export interface RecordingOptions {
  format: 'mp4' | 'webm' | 'mov'; // Add new format
  // ... other options
}

// 2. Update service
// src/services/RecordingService.ts
class RecordingService {
  private getRecordingFormat(format: string): string {
    switch (format) {
      case 'mov': return 'video/quicktime';
      // ... handle new format
    }
  }
}

// 3. Update UI component
// src/components/RecordingSettings.tsx
// Add new format option to settings
```

## 🧪 Testing

```bash
# Run tests (when test suite is added)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Build & Deployment

### Web Application
```bash
npm run build
npm run preview  # Preview production build
```

### Chrome Extension
```bash
npm run build
# Upload dist/ folder to Chrome Web Store
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Follow the modular architecture**
   - Keep components small and focused
   - Use TypeScript interfaces for all data structures
   - Add proper error handling
4. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Coding Standards

- **Modular Design**: Each file should have a single responsibility
- **TypeScript**: All code must be properly typed
- **React Hooks**: Use custom hooks for complex state logic
- **Error Handling**: Implement proper error boundaries and logging
- **Documentation**: Comment complex logic and update README

### Code Review Checklist

- [ ] Code follows modular architecture principles
- [ ] TypeScript types are properly defined
- [ ] Components are tested manually
- [ ] No console errors in development
- [ ] Extension functionality works correctly
- [ ] Responsive design is maintained

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Lucide React](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build system

## 📞 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Documentation**: [Project Wiki](link-to-wiki)

---

**Made with ❤️ by the open source community**

*Star ⭐ this repository if you find it helpful!*
