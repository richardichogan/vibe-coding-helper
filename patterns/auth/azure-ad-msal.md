# Azure AD Authentication with MSAL (React + TypeScript)

> Proven pattern from ACRE project - Multi-scope Azure AD authentication with automatic token refresh

## Overview

This pattern implements Azure AD authentication using MSAL (Microsoft Authentication Library) with support for multiple API scopes:
- Log Analytics (Sentinel)
- Azure Resource Manager
- Microsoft Defender for Endpoint
- Microsoft 365 Defender

## Key Features

✅ **Progressive Consent**: Initial login with minimal scope, additional scopes requested as needed  
✅ **Silent Token Refresh**: Automatic token renewal without re-login  
✅ **Multiple Tenants**: Supports single and multi-tenant applications  
✅ **Popup Fallback**: Graceful handling of popup blockers with redirect fallback  
✅ **Persistent Sessions**: localStorage caching for better user experience  

## Configuration (`azureConfig.ts`)

\`\`\`typescript
import { Configuration, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: \`https://login.microsoftonline.com/\${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}\`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage', // Better persistence than sessionStorage
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Primary scope (Log Analytics / Sentinel)
export const loginRequest = {
  scopes: ['https://api.loganalytics.io/Data.Read'],
  prompt: 'select_account',
};

// Azure Resource Manager scope
export const armLoginRequest = {
  scopes: ['https://management.azure.com/user_impersonation'],
  prompt: 'select_account',
};

// Microsoft Defender for Endpoint
export const defenderLoginRequest = {
  scopes: ['https://api.securitycenter.microsoft.com/.default'],
  prompt: 'select_account',
};

// Microsoft 365 Defender (Advanced Hunting)
export const m365DefenderLoginRequest = {
  scopes: ['https://api.security.microsoft.com/.default'],
  prompt: 'select_account',
};
\`\`\`

## AuthProvider Component

\`\`\`tsx
import React, { useState, useEffect } from 'react';
import { msalInstance } from '../config/azureConfig';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await msalInstance.initialize();
      await msalInstance.handleRedirectPromise(); // Handle redirect flow
      
      const accounts = msalInstance.getAllAccounts();
      setIsAuthenticated(accounts.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Initial login with primary scope
      await msalInstance.loginPopup(loginRequest);
      
      // Progressive consent: request additional scopes silently
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.acquireTokenSilent({
          ...armLoginRequest,
          account: accounts[0],
        }).catch(() => {}); // Ignore if not available
        
        await msalInstance.acquireTokenSilent({
          ...defenderLoginRequest,
          account: accounts[0],
        }).catch(() => {});
      }
      
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err?.errorCode === 'popup_window_error') {
        // Popup blocked - redirect fallback
        await msalInstance.loginRedirect(loginRequest);
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <h1>Please Sign In</h1>
        {error && <div className="error">{error}</div>}
        <button onClick={handleLogin}>Sign In with Azure AD</button>
      </div>
    );
  }

  return <>{children}</>;
};
\`\`\`

## Getting Access Tokens

\`\`\`typescript
export async function getAccessToken(scopes: string[]): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    throw new Error('No authenticated accounts found');
  }

  try {
    // Try silent token acquisition first
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    // Silent acquisition failed - use popup
    const response = await msalInstance.acquireTokenPopup({
      scopes,
      account: accounts[0],
    });
    return response.accessToken;
  }
}
\`\`\`

## Azure App Registration Setup

### Required API Permissions

1. **Log Analytics**:
   - API: Azure Log Analytics
   - Permission: \`Data.Read\` (Delegated)

2. **Azure Resource Manager**:
   - API: Azure Service Management
   - Permission: \`user_impersonation\` (Delegated)

3. **Microsoft Defender for Endpoint**:
   - API: Microsoft Threat Protection
   - Permission: \`AdvancedHunting.Read.All\` (Delegated)

4. **Microsoft 365 Defender**:
   - API: Microsoft Graph
   - Permission: \`ThreatHunting.Read.All\` (Delegated)

### App Registration Configuration

\`\`\`
Authentication:
  Platform: Single-page application (SPA)
  Redirect URIs: https://yourdomain.com, http://localhost:3000
  Implicit grant: ❌ (Not needed for MSAL 2.x+)
  Allow public client flows: ❌

Token configuration:
  Access token: Enabled
  ID token: Enabled
\`\`\`

## Environment Variables

\`\`\`.env
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_REDIRECT_URI=http://localhost:3000
\`\`\`

## Troubleshooting

### Issue: "Popup blocked"
**Solution**: Use redirect flow as fallback (pattern handles automatically)

### Issue: "AADSTS65001: User did not consent"
**Solution**: Admin consent required for application permissions, or use delegated permissions

### Issue: "Token expired"
**Solution**: acquireTokenSilent handles refresh automatically, no action needed

### Issue: "Network error"
**Solution**: Check CORS settings in Azure AD app registration

## Best Practices

✅ **Always initialize MSAL**: Call \`msalInstance.initialize()\` before any auth operations  
✅ **Handle redirects**: Call \`handleRedirectPromise()\` on app startup  
✅ **Silent tokens first**: Always try \`acquireTokenSilent\` before \`acquireTokenPopup\`  
✅ **Progressive consent**: Request minimal scopes initially, add more as needed  
✅ **Cache tokens**: Use localStorage for better persistence across sessions  

## Dependencies

\`\`\`json
{
  "@azure/msal-browser": "^3.0.0",
  "@azure/msal-react": "^2.0.0"
}
\`\`\`

## Source

Extracted from: **ACRE Project** (Sentinel Data Lake Dashboard)  
Last verified: November 2025  
Status: ✅ Production-ready
