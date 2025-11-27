# Vibe Coding Helper

> Reusable code patterns extracted from working projects - Access from anywhere

## What is This?

Vibe Coding Helper is a pattern library that captures proven, working code from real projects and makes them reusable across all your work. No more recreating auth flows, styling systems, or deployment configs from scratch.

## Available Patterns

### Authentication
- **Azure AD MSAL** (`patterns/auth/azure-ad-msal.md`)
  - Multi-scope authentication (Sentinel, ARM, Defender, M365)
  - Progressive consent flow
  - Silent token refresh
  - Production-ready from ACRE project

### Styling
- **Carbon Design Dark Theme** (`patterns/styling/carbon-dark-theme.md`)
  - Professional dark theme with IBM Carbon Design System
  - Consistent color system (#1e1e1e backgrounds)
  - Severity color coding
  - Responsive navigation

### Routing
- **React Router Navigation** (`patterns/routing/react-router-navigation.md`)
  - Multi-page SPA with React Router
  - Full-screen vs contained layouts
  - Active state navigation
  - Production deployment config

## How to Use

### From GitHub

Clone the repository:
```bash
git clone https://github.com/richardichogan/vibe-coding-helper.git
cd vibe-coding-helper
```

### Browse Patterns

All patterns are in the `patterns/` directory organized by category:
```
patterns/
  auth/
    azure-ad-msal.md
  styling/
    carbon-dark-theme.md
  routing/
    react-router-navigation.md
```

Each pattern includes:
- Complete working code
- Environment variables needed
- Common pitfalls and solutions
- Integration steps
- Testing guide

## Contributing Patterns

Have a working pattern to share? Add it to the appropriate category:

1. Create markdown file: `patterns/[category]/[name].md`
2. Include complete code examples
3. Document environment variables
4. Add troubleshooting section
5. Submit PR or commit directly

## Pattern Categories

- **auth/** - Authentication and authorization
- **styling/** - UI/UX patterns and themes
- **routing/** - Navigation and routing
- **api/** - Backend and API integrations
- **deployment/** - Deployment and CI/CD
- **debugging/** - Debugging workflows and tools

## Philosophy

> "Code quality shouldn't be inconsistent. If it works in one project, it should work in all projects."

This library exists because:
-  Proven patterns from real, working projects
-  Saves time (no recreation from scratch)
-  Reduces bugs (battle-tested code)
-  Improves consistency across projects

## Source Projects

Patterns extracted from:
- **ACRE** - Sentinel Data Lake Dashboard (Azure AD auth, Carbon UI, React Router)
- More projects coming soon...

## License

MIT

## Author

Richard Hogan
