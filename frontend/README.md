# Heinz Boilerplate Frontend

A production-ready Next.js frontend with TypeScript, component library, and comprehensive testing setup.

## Tech Stack

- **Next.js 14** with TypeScript
- **Component Library** with Storybook
- **Testing**: Jest + React Testing Library + Playwright
- **Styling**: CSS Modules
- **PWA Support** with Service Worker
- **Code Quality**: ESLint + Prettier + SonarQube

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Backend API running (for health checks)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Run TypeScript type checking
```

### Testing
```bash
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run Playwright e2e tests
npm run test:e2e:headed # Run e2e tests with browser UI
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Storybook
```bash
npm run storybook    # Start Storybook dev server
npm run build-storybook # Build Storybook for production
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button/         # Button component with tests & stories
│   │   ├── Card/           # Card component with tests & stories
│   │   ├── Input/          # Input component with tests & stories
│   │   ├── Nav/            # Navigation component
│   │   └── Landing/        # Landing page component
│   ├── pages/              # Next.js pages
│   │   ├── _app.tsx        # App wrapper with PWA registration
│   │   ├── _document.tsx   # HTML document structure
│   │   └── index.tsx       # Home page
│   └── styles/             # Global styles
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # PWA icons (placeholder)
├── tests/e2e/             # Playwright e2e tests
├── .storybook/            # Storybook configuration
└── charts/                # Helm chart for Kubernetes
```

## Component Library

### Available Components

- **Button**: Primary, secondary, and outline variants with multiple sizes
- **Input**: Form input with label, validation, and help text
- **Card**: Content container with title, subtitle, and variants
- **Nav**: Navigation bar with brand and menu items
- **Landing**: Main landing page showcasing features

### Using Components

```tsx
import { Button, Card, Input } from '@/components';

function MyPage() {
  return (
    <Card title="Example" variant="elevated">
      <Input label="Name" placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### Storybook

Access the component library at [http://localhost:6006](http://localhost:6006) when running Storybook.

```bash
npm run storybook
```

## Testing

### Unit Tests (Jest + React Testing Library)

- Tests located alongside components (`*.test.tsx`)
- Coverage threshold: 70%
- Run with `npm test`

### E2E Tests (Playwright)

- Tests in `tests/e2e/`
- Tests landing page content and backend API health checks
- Run with `npm run test:e2e`

### Running Tests with Backend

For full e2e testing, start the backend first:

```bash
# In root directory
docker-compose up backend postgres redis

# In frontend directory
npm run test:e2e
```

## PWA (Progressive Web App)

### Current Features

- Web App Manifest (`/manifest.json`)
- Service Worker registration
- Placeholder icons
- Offline-first caching strategy

### Adding Real Icons

1. Create icons in required sizes (see `/public/icons/README.md`)
2. Replace placeholder files in `/public/icons/`
3. Update `manifest.json` if changing sizes
4. Test on mobile devices

### PWA Installation

- Browsers will show "Add to Home Screen" when PWA criteria are met
- Icons and app name configured in `manifest.json`
- Service Worker enables offline functionality

## Environment Variables

Create `.env.local` for local development:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration  
NEXT_PUBLIC_APP_NAME=Heinz Boilerplate
NEXT_PUBLIC_APP_DESCRIPTION=Production-ready boilerplate

# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

## Docker

### Development with Docker Compose

```bash
# From root directory
docker-compose up frontend
```

### Production Docker Build

```bash
# Build image
docker build -t heinz-boilerplate/frontend .

# Run container
docker run -p 3000:3000 heinz-boilerplate/frontend
```

## Kubernetes Deployment

### Using Helm

```bash
# Install chart
helm install frontend charts/frontend/

# Upgrade
helm upgrade frontend charts/frontend/

# Uninstall
helm uninstall frontend
```

### Configuration

Edit `charts/frontend/values.yaml` for:
- Resource limits
- Environment variables
- Ingress configuration
- Auto-scaling settings

## Code Quality

### ESLint + Prettier

- Configuration in `.eslintrc.json` and `.prettierrc`
- Run `npm run lint:fix` to auto-fix issues
- Pre-commit hooks recommended

### SonarQube

- Configuration in `sonar-project.properties`
- Analyzes TypeScript, test coverage, and code quality
- Excludes Storybook stories and build artifacts

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with modern JavaScript support

## Performance

### Optimization Features

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- CSS Modules for scoped styling
- Production builds minified and optimized

### Monitoring

- Web Vitals automatically tracked
- Custom performance monitoring can be added
- Integration with observability stack (Prometheus/Grafana)

## Contributing

### Development Workflow

1. Create feature branch
2. Add/update tests for changes
3. Run `npm run lint:fix` and `npm test`
4. Update Storybook stories if adding/changing components
5. Test in multiple browsers
6. Update documentation

### Component Development

1. Create component in `src/components/ComponentName/`
2. Add TypeScript interfaces
3. Create CSS Module for styling
4. Write Jest unit tests
5. Create Storybook stories
6. Export from `src/components/index.ts`

## Troubleshooting

### Common Issues

**Build Errors**
- Check TypeScript errors with `npm run type-check`
- Verify all imports are correct
- Clear `.next` directory and rebuild

**Test Failures**
- Ensure backend is running for e2e tests
- Check environment variables are set
- Update test snapshots if UI changed

**Storybook Issues**
- Clear Storybook cache: `npx storybook@latest info`
- Check for conflicting dependencies
- Verify story file naming conventions

**PWA Not Installing**
- Check manifest.json is accessible
- Verify HTTPS in production
- Ensure service worker is registered
- Check browser PWA requirements

### Getting Help

- Check existing GitHub issues
- Review Next.js documentation
- Consult component library in Storybook
- Review test examples for patterns