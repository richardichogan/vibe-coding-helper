# Vibe Coding Helper

> Reusable code patterns extracted from working projects - Access from anywhere

## What is This?

Vibe Coding Helper is a pattern library that captures proven, working code from real projects and makes them reusable across all your work. No more recreating auth flows, styling systems, or deployment configs from scratch.

Available as both an **MCP server** (for VS Code integration) and a **REST API** (for HTTP access).

## Available Patterns

### Authentication
- **Azure AD MSAL** (`patterns/auth/azure-ad-msal.md`)
  - Multi-scope authentication (Sentinel, ARM, Defender, M365)
  - Progressive consent flow
  - Silent token refresh
  - Production-ready from ACRE project

### Logging
- **Application Insights with Query Debugging** (`patterns/logging/application-insights-query-logging.md`)
  - Production telemetry with Azure Application Insights
  - Development query debugging to JSON
  - Console logging helper
  - Structured logging (DEBUG/INFO/WARN/ERROR)
  - Complete LoggingService implementation

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

## Usage Options

### Option 1: MCP Server (VS Code Integration)

**Already configured!** The MCP server is now installed in your VS Code settings.

**To use:**
1. Open VS Code
2. Open GitHub Copilot Chat
3. Type `@vibe-coding-helper` to access patterns
4. Use tools:
   - `search_patterns` - Search by keyword
   - `get_pattern_code` - Get full pattern code
   - `list_patterns_by_category` - Browse by category

**Example:**
```
@vibe-coding-helper search for Azure AD authentication
@vibe-coding-helper get the logging pattern code
```

### Option 2: REST API (HTTP Access)

**Live at:** https://vibe-coding-helper.azurewebsites.net

**Endpoints:**
```bash
# List all patterns
curl https://vibe-coding-helper.azurewebsites.net/api/patterns

# Search patterns
curl https://vibe-coding-helper.azurewebsites.net/api/patterns/search?q=logging

# Get specific pattern
curl https://vibe-coding-helper.azurewebsites.net/api/patterns/auth/azure-ad-msal
```

**From PowerShell:**
```powershell
# List all patterns
Invoke-RestMethod -Uri "https://vibe-coding-helper.azurewebsites.net/api/patterns"

# Get logging pattern
Invoke-RestMethod -Uri "https://vibe-coding-helper.azurewebsites.net/api/patterns/logging/application-insights-query-logging" | Select-Object -ExpandProperty content
```

### Option 3: Local Files (Cloned Repo)

Clone and browse locally:
```bash
git clone https://github.com/richardichogan/vibe-coding-helper.git
cd vibe-coding-helper
```

All patterns are in `patterns/` organized by category.

### Option 4: Direct GitHub Access

Browse patterns directly on GitHub:
https://github.com/richardichogan/vibe-coding-helper/tree/master/patterns

## Running Locally

### As MCP Server (stdio)
```bash
npm run mcp
```

### As REST API (HTTP)
```bash
npm start
# Serves on http://localhost:3000
```

## Pattern Structure

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
5. Commit and push (auto-deploys to Azure)

## Pattern Categories

- **auth/** - Authentication and authorization
- **logging/** - Logging, telemetry, and monitoring
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

## Technical Details

- **MCP Server**: Uses `@modelcontextprotocol/sdk` with stdio transport
- **REST API**: Express.js with CORS enabled
- **Deployment**: Azure Web App (F1 Free tier, auto-deploy from GitHub)
- **Node.js**: 20+

## Source Projects

Patterns extracted from:
- **ACRE** - Sentinel Data Lake Dashboard (Azure AD auth, Carbon UI, React Router, logging)
- More projects coming soon...

## License

MIT

## Author

Richard Hogan
