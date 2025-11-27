# React Router Navigation Pattern

> Proven pattern from ACRE project - Multi-page SPA with conditional content rendering

## Overview

This pattern implements React Router with:
- Horizontal navigation bar with active states
- Full-screen views (Environment, Attack Simulation)
- Contained views with query selector (Table, Dashboard, Graph)
- Type-safe routing with TypeScript

## Key Features

✅ **Client-side routing**: No page reloads, instant navigation  
✅ **Active state tracking**: Visual feedback for current page  
✅ **Conditional layouts**: Full-screen vs contained content  
✅ **Clean URLs**: No hash routing, proper history support  

## Route Structure

\`\`\`typescript
/home              → Security Dashboard (default landing page)
/environment       → Environment View (full-screen topology)
/attack-simulation → Attack Simulation View (full-screen)
/table             → Results Table (contained, with query selector)
/query-dashboard   → Query Dashboard (contained, with query selector)
/graph             → Graph View (contained, with query selector)
\`\`\`

## App.tsx (Root Component)

\`\`\`tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header, HeaderName, Theme } from '@carbon/react';
import { Navigation } from './components/Navigation';
import { AppContent } from './components/AppContent';
import { AuthProvider } from './components/AuthProvider';
import './App.scss';

function App() {
  return (
    <Theme theme="g100">
      <div className="app">
        <AuthProvider>
          <BrowserRouter>
            <Header aria-label="ACRE Dashboard">
              <HeaderName href="/" prefix="ACRE">
                Sentinel Data Lake Dashboard
              </HeaderName>
            </Header>
            
            <Navigation />
            
            <div className="app-content">
              <AppContent />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </Theme>
  );
}

export default App;
\`\`\`

## Navigation Component

\`\`\`tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Security,
  Earth,
  ChartRadar,
  Table,
  Dashboard,
  Network_3
} from '@carbon/icons-react';
import './Navigation.css';

export const Navigation: React.FC = () => {
  return (
    <nav className="app-navigation">
      <NavLink 
        to="/home" 
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        <Security size={20} />
        <span>Security Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/environment"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        <Earth size={20} />
        <span>Environment</span>
      </NavLink>
      
      <NavLink 
        to="/attack-simulation"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        <ChartRadar size={20} />
        <span>Attack Simulation</span>
      </NavLink>
      
      <NavLink 
        to="/table"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        <Table size={20} />
        <span>Table View</span>
      </NavLink>
      
      <NavLink 
        to="/query-dashboard"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        <Dashboard size={20} />
        <span>Query Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/graph"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        <Network_3 size={20} />
        <span>Graph View</span>
      </NavLink>
    </nav>
  );
};
\`\`\`

## AppContent Component (Route Logic)

\`\`\`tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SecurityDashboard } from './SecurityDashboard';
import { EnvironmentView } from './EnvironmentView';
import { AttackSimulationView } from './AttackSimulationView';
import { ResultsTable } from './ResultsTable';
import { Dashboard } from './Dashboard';
import { GraphView } from './GraphView';
import { QuerySelector } from './QuerySelector';

interface AppContentProps {
  // Props for query-based views
  tableData?: any;
  isExecuting?: boolean;
  error?: string | null;
  queryName?: string;
  executeQuery?: (queryId: string) => void;
  queryRelatedActivity?: (entityValue: string, entityType: string) => void;
}

export const AppContent: React.FC<AppContentProps> = ({
  tableData,
  isExecuting,
  error,
  queryName,
  executeQuery,
  queryRelatedActivity,
}) => {
  const location = useLocation();
  
  // Determine if current route should show query selector
  const showQuerySelector = ['/table', '/query-dashboard', '/graph'].includes(location.pathname);
  
  return (
    <>
      {/* Query selector for data-driven views */}
      {showQuerySelector && (
        <QuerySelector 
          onExecuteQuery={executeQuery}
          isExecuting={isExecuting}
        />
      )}
      
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Full-screen views (no query selector) */}
        <Route 
          path="/home" 
          element={
            <div className="route-content-fullscreen">
              <SecurityDashboard />
            </div>
          } 
        />
        
        <Route 
          path="/environment" 
          element={
            <div className="route-content-fullscreen">
              <EnvironmentView />
            </div>
          } 
        />
        
        <Route 
          path="/attack-simulation" 
          element={
            <div className="route-content-fullscreen">
              <AttackSimulationView />
            </div>
          } 
        />
        
        {/* Contained views (with query selector) */}
        <Route 
          path="/table" 
          element={
            <div className="route-content">
              <ResultsTable 
                data={tableData}
                isLoading={isExecuting}
                error={error}
                onQueryRelatedActivity={queryRelatedActivity}
              />
            </div>
          } 
        />
        
        <Route 
          path="/query-dashboard" 
          element={
            <div className="route-content">
              <Dashboard 
                data={tableData}
                isLoading={isExecuting}
                error={error}
              />
            </div>
          } 
        />
        
        <Route 
          path="/graph" 
          element={
            <div className="route-content">
              <GraphView 
                data={tableData}
                isLoading={isExecuting}
                error={error}
              />
            </div>
          } 
        />
      </Routes>
    </>
  );
};
\`\`\`

## Route Content Styling

\`\`\`css
/* Contained views with query selector */
.route-content {
  padding: 1rem;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  min-height: 400px;
}

/* Full-screen views */
.route-content-fullscreen {
  padding: 0;
  margin: 0;
  width: 100%;
  height: calc(100vh - 48px - 2.5rem); /* Viewport - header - nav spacing */
  overflow: hidden; /* Prevent scroll, let child components handle it */
}
\`\`\`

## Programmatic Navigation

\`\`\`tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToEnvironment = () => {
    navigate('/environment');
  };
  
  const goBack = () => {
    navigate(-1); // Go back one page
  };
  
  return (
    <button onClick={goToEnvironment}>View Environment</button>
  );
}
\`\`\`

## useLocation Hook (Current Route)

\`\`\`tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  
  // Current pathname
  console.log(location.pathname); // e.g., "/table"
  
  // Route-specific logic
  const isFullScreen = ['/home', '/environment', '/attack-simulation'].includes(location.pathname);
  
  return (
    <div className={isFullScreen ? 'fullscreen-layout' : 'contained-layout'}>
      {/* Content */}
    </div>
  );
}
\`\`\`

## Link vs NavLink

\`\`\`tsx
import { Link, NavLink } from 'react-router-dom';

// Basic link (no active state)
<Link to="/home">Home</Link>

// NavLink with active state (for navigation)
<NavLink 
  to="/home"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  Home
</NavLink>

// NavLink with style function
<NavLink 
  to="/home"
  style={({ isActive }) => ({
    color: isActive ? '#78a9ff' : '#c6c6c6'
  })}
>
  Home
</NavLink>
\`\`\`

## Route Parameters

\`\`\`tsx
import { useParams } from 'react-router-dom';

// Route definition
<Route path="/incidents/:id" element={<IncidentDetail />} />

// Component
function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  
  return <div>Incident ID: {id}</div>;
}

// Navigate to parameterized route
navigate('/incidents/12345');
\`\`\`

## Vite Configuration (SPA Routing)

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
\`\`\`

## Production Setup (Azure Static Web Apps)

\`\`\`json
// staticwebapp.config.json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/api/*"]
  },
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
\`\`\`

## Dependencies

\`\`\`json
{
  "react-router-dom": "^6.20.0"
}
\`\`\`

## Installation

\`\`\`bash
npm install react-router-dom
\`\`\`

## Best Practices

✅ **Use NavLink for navigation**: Provides active state automatically  
✅ **Conditional layouts**: Full-screen vs contained based on route  
✅ **Default redirect**: Navigate to /home on root path  
✅ **Clean URLs**: Use BrowserRouter, not HashRouter  
✅ **useLocation for logic**: Route-aware conditional rendering  

## Common Pitfalls

❌ **Forgetting index.html rewrite**: Production routing breaks without it  
❌ **Using <a> tags**: Use <Link> or <NavLink> instead  
❌ **Hard-coded active states**: Use NavLink's isActive prop  
❌ **Missing Navigate import**: Need for default redirect  

## Migration from Tabs to Routes

\`\`\`tsx
// OLD (Tab-based)
const [activeTab, setActiveTab] = useState('home');

<button onClick={() => setActiveTab('home')}>Home</button>
{activeTab === 'home' && <Home />}

// NEW (Router-based)
<NavLink to="/home">Home</NavLink>
<Route path="/home" element={<Home />} />
\`\`\`

## Source

Extracted from: **ACRE Project** (Sentinel Data Lake Dashboard)  
Last verified: November 2025  
Status: ✅ Production-ready
