# Setting up your Development Environment

This guide explains how to set up a development environment for DiracX Web.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Git

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DIRACGrid/diracx-web.git
   cd diracx-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The development server will start on `http://localhost:3000` by default.

## Development Workflow

### File Structure

The main directories in the project:
- `packages/` - Contains all the packages (components, main web app, extensions)
- `public/` - Static assets
- `docs/` - Documentation

### Running in Development Mode

When running in development mode:
- Hot reload is enabled for instant feedback
- Source maps are available for debugging
- Development-specific features are enabled

### Environment Configuration

Create a `.env.local` file in the root directory to configure environment variables:

```bash
# DiracX API endpoint
NEXT_PUBLIC_DIRACX_URL=http://localhost:8000

# OIDC configuration
NEXT_PUBLIC_OIDC_AUTHORITY=your-oidc-authority
NEXT_PUBLIC_OIDC_CLIENT_ID=your-client-id
```

## Building for Production

To build the application for production:

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

## Testing

Run the test suite:

```bash
npm test
```

For continuous testing during development:

```bash
npm run test:watch
```

## Troubleshooting

### Common Issues

1. **Port already in use:** The default port 3000 might be occupied. Use a different port:
   ```bash
   npm run dev -- -p 3001
   ```

2. **Module not found:** Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

For more detailed information, see the [CONTRIBUTING.md](/CONTRIBUTING.md) file.