# Carbon Design System Dark Theme Setup

> Proven pattern from ACRE project - Consistent dark theme with Carbon Design System

## Overview

This pattern implements a professional dark theme using IBM Carbon Design System tokens and guidelines. Includes:
- Carbon g100 (dark) theme tokens
- Responsive navigation bar
- Consistent background colors (#1e1e1e)
- Proper contrast ratios for accessibility

## Key Features

✅ **Carbon Tokens**: Uses official IBM Carbon color tokens  
✅ **Semantic Colors**: Theme-aware color definitions  
✅ **Responsive**: Mobile-friendly navigation and layouts  
✅ **Accessible**: WCAG AA compliant contrast ratios  
✅ **Consistent**: Unified styling across all components  

## Main App Styling (`App.scss`)

\`\`\`scss
@use '@carbon/react/scss/theme' with (
  $theme: 'g100' // Carbon dark theme
);
@use '@carbon/react';

.app {
  min-height: 100vh;
  background: #1e1e1e; // Slightly warmer than pure black
  color: #ffffff;
  
  &-content {
    margin-top: 2.5rem; // Space for fixed navigation (40px)
  }
}

// Contained views (with query selector)
.route-content {
  padding: 1rem;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  
  &-fullscreen {
    // Full-screen views (Environment, Attack Simulation)
    padding: 0;
    margin: 0;
    width: 100%;
    height: calc(100vh - 48px - 2.5rem); // Viewport - header - nav spacing
  }
}
\`\`\`

## Navigation Component (`Navigation.tsx`)

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

## Navigation Styling (`Navigation.css`)

\`\`\`css
.app-navigation {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #262626; /* Slightly lighter than app background */
  border-bottom: 1px solid #3a3a3a;
  position: sticky;
  top: 48px; /* Below Carbon header */
  z-index: 100;
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  color: #c6c6c6; /* Muted text */
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  background: #353535;
  color: #ffffff;
}

.nav-link.active {
  background: #353535;
  color: #78a9ff; /* Carbon blue-40 */
  border-bottom: 2px solid #78a9ff;
}

/* Dark theme overrides */
[data-carbon-theme="g100"] .nav-link {
  color: #c6c6c6;
}

[data-carbon-theme="g100"] .nav-link:hover {
  background: #353535;
  color: #ffffff;
}

[data-carbon-theme="g100"] .nav-link.active {
  color: #78a9ff;
  background: #353535;
}
\`\`\`

## Card Component Styling

\`\`\`css
.card {
  background: #262626;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 1rem;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  border-color: #525252;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #3a3a3a;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #c6c6c6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
  line-height: 1;
}
\`\`\`

## Severity Color System

\`\`\`css
/* Semantic severity colors */
.severity-critical {
  color: #da1e28; /* Carbon red-60 */
}

.severity-high {
  color: #ff832b; /* Carbon orange-40 */
}

.severity-medium {
  color: #f1c21b; /* Carbon yellow-30 */
}

.severity-low {
  color: #42be65; /* Carbon green-50 */
}

/* Background variants */
.severity-critical-bg {
  background: rgba(218, 30, 40, 0.15);
  border-left: 3px solid #da1e28;
}

.severity-high-bg {
  background: rgba(255, 131, 43, 0.15);
  border-left: 3px solid #ff832b;
}

.severity-medium-bg {
  background: rgba(241, 194, 27, 0.15);
  border-left: 3px solid #f1c21b;
}

.severity-low-bg {
  background: rgba(66, 190, 101, 0.15);
  border-left: 3px solid #42be65;
}
\`\`\`

## Responsive Breakpoints

\`\`\`css
/* Mobile */
@media (max-width: 672px) {
  .app-navigation {
    flex-direction: column;
    gap: 0;
  }
  
  .nav-link {
    width: 100%;
    justify-content: flex-start;
    border-radius: 0;
  }
}

/* Tablet */
@media (min-width: 672px) and (max-width: 1056px) {
  .app-navigation {
    flex-wrap: wrap;
  }
}

/* Desktop */
@media (min-width: 1056px) {
  .app-navigation {
    justify-content: flex-start;
  }
}
\`\`\`

## Carbon Component Overrides

\`\`\`css
/* Override Carbon component styles for dark theme */
[data-carbon-theme="g100"] {
  .cds--data-table {
    background: #262626;
  }
  
  .cds--data-table-header {
    background: #353535;
  }
  
  .cds--data-table tbody tr:hover {
    background: #353535;
  }
  
  .cds--btn--primary {
    background: #0f62fe; /* Carbon blue-60 */
  }
  
  .cds--btn--primary:hover {
    background: #0353e9; /* Carbon blue-70 */
  }
}
\`\`\`

## Color Reference

\`\`\`
Background Layers:
  App Background:     #1e1e1e (warmest black)
  Card Background:    #262626 (slightly lighter)
  Hover States:       #353535 (lightest dark)
  
Borders:
  Default:            #3a3a3a
  Hover:              #525252
  
Text:
  Primary:            #ffffff
  Secondary:          #c6c6c6
  Tertiary:           #8d8d8d
  
Accents:
  Primary (Blue):     #78a9ff (Carbon blue-40)
  Critical:           #da1e28 (Carbon red-60)
  High:               #ff832b (Carbon orange-40)
  Medium:             #f1c21b (Carbon yellow-30)
  Low:                #42be65 (Carbon green-50)
\`\`\`

## Setup in App.tsx

\`\`\`tsx
import React from 'react';
import { Theme } from '@carbon/react';
import './App.scss';

function App() {
  return (
    <Theme theme="g100"> {/* Carbon dark theme */}
      <div className="app">
        {/* App content */}
      </div>
    </Theme>
  );
}
\`\`\`

## Dependencies

\`\`\`json
{
  "@carbon/react": "^1.40.0",
  "@carbon/icons-react": "^11.30.0"
}
\`\`\`

## Installation

\`\`\`bash
npm install @carbon/react @carbon/icons-react sass
\`\`\`

## Best Practices

✅ **Use Carbon tokens**: Reference official color tokens, not hardcoded hex values  
✅ **Layer backgrounds**: Use #1e1e1e → #262626 → #353535 for depth  
✅ **Consistent borders**: Use #3a3a3a for all borders  
✅ **Semantic colors**: Use severity colors for meaning, not decoration  
✅ **Test contrast**: Verify WCAG AA compliance (4.5:1 for text)  

## Common Pitfalls

❌ **Pure black (#000000)**: Too harsh, use #1e1e1e instead  
❌ **Inconsistent gaps**: Use rem units (0.5rem, 1rem, 2rem) consistently  
❌ **Missing hover states**: All interactive elements need visible hover  
❌ **Light theme colors in dark theme**: Always test in g100 theme  

## Source

Extracted from: **ACRE Project** (Sentinel Data Lake Dashboard)  
Last verified: November 2025  
Status: ✅ Production-ready
