# Application Insights Logging with Query Debugging

> Proven pattern from ACRE project - Production telemetry + development query logging

## Overview

This pattern implements a comprehensive logging solution with three destinations:
1. **Azure Application Insights** - Production telemetry (errors, events, metrics)
2. **JSON Query Logs** - Development debugging (KQL queries, results, durations)
3. **Console Output** - Real-time visibility in browser DevTools

## Key Features

 **Structured Logging**: All logs include timestamp, component, level, contextual data  
 **Application Insights Integration**: Automatic production telemetry  
 **Query Debugging**: JSON logs readable by Copilot for debugging  
 **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR  
 **Circular Reference Handling**: Safely logs complex objects  
 **Size Limiting**: Prevents oversized log entries (64KB max)  
 **In-Memory Buffer**: 1000 recent entries for debugging UI  

## LoggingService Implementation

\`\`\`typescript
// src/services/loggingService.ts
import { ApplicationInsights } from ''@microsoft/applicationinsights-web'';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  component?: string;
}

class LoggingService {
  private appInsights: ApplicationInsights | null = null;
  private minLogLevel: LogLevel = LogLevel.INFO;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
    
    if (connectionString) {
      try {
        this.appInsights = new ApplicationInsights({
          config: {
            connectionString,
            enableAutoRouteTracking: true,
            disableFetchTracking: false,
            disableAjaxTracking: false,
            enableCorsCorrelation: true,
            enableRequestHeaderTracking: true,
            enableResponseHeaderTracking: true,
          }
        });
        this.appInsights.loadAppInsights();
        this.appInsights.trackPageView();
      } catch (error) {
        this.appInsights = null;
      }
    } else {
      // Development mode - enable debug logging
      this.minLogLevel = LogLevel.DEBUG;
    }
  }

  // Standard logging methods
  debug(message: string, data?: any, component?: string) {
    this.log(LogLevel.DEBUG, message, data, component);
  }

  info(message: string, data?: any, component?: string) {
    this.log(LogLevel.INFO, message, data, component);
  }

  warn(message: string, data?: any, component?: string) {
    this.log(LogLevel.WARN, message, data, component);
  }

  error(message: string, error?: any, component?: string) {
    this.log(LogLevel.ERROR, message, error, component);
  }

  private log(level: LogLevel, message: string, data?: any, component?: string) {
    if (level < this.minLogLevel) return;

    const logEntry: LogEntry = {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date(),
      component,
    };

    // Add to buffer
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output
    const levelName = LogLevel[level];
    const prefix = component ? \`[\${component}]\` : '''';
    console.log(\`[\${levelName}] \${prefix} \${message}\`, data);

    // Application Insights
    if (this.appInsights) {
      const properties = { component, ...this.sanitizeData(data) };
      
      switch (level) {
        case LogLevel.ERROR:
          if (data instanceof Error) {
            this.appInsights.trackException({ exception: data, properties });
          } else {
            this.appInsights.trackTrace({ message, severityLevel: 3, properties });
          }
          break;
        case LogLevel.WARN:
          this.appInsights.trackTrace({ message, severityLevel: 2, properties });
          break;
        case LogLevel.INFO:
          this.appInsights.trackTrace({ message, severityLevel: 1, properties });
          break;
        case LogLevel.DEBUG:
          this.appInsights.trackTrace({ message, severityLevel: 0, properties });
          break;
      }
    }
  }

  // Event tracking
  trackEvent(name: string, properties?: any, measurements?: any) {
    if (this.appInsights) {
      this.appInsights.trackEvent({ name, properties, measurements });
    }
    console.log(\`[EVENT] \${name}\`, properties, measurements);
  }

  trackMetric(name: string, value: number, properties?: any) {
    if (this.appInsights) {
      this.appInsights.trackMetric({ name, average: value }, properties);
    }
    console.log(\`[METRIC] \${name}: \${value}\`, properties);
  }

  trackPageView(name: string, properties?: any) {
    if (this.appInsights) {
      this.appInsights.trackPageView({ name, properties });
    }
    console.log(\`[PAGE_VIEW] \${name}\`, properties);
  }

  // Sanitize data for Application Insights
  private sanitizeData(data: any): any {
    try {
      const jsonString = JSON.stringify(data, this.getCircularReplacer());
      if (jsonString.length > 65536) {
        return { 
          _truncated: true, 
          _originalSize: jsonString.length, 
          _sample: jsonString.substring(0, 1000) 
        };
      }
      return JSON.parse(jsonString);
    } catch (error) {
      return { _error: ''Failed to sanitize data'', _type: typeof data };
    }
  }

  private getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === ''object'' && value !== null) {
        if (seen.has(value)) return ''[Circular]'';
        seen.add(value);
      }
      return value;
    };
  }

  // Query debugging (writes to JSON file via backend)
  writeQueryLog(entry: {
    component: string;
    action: string;
    computerName?: string;
    query?: string;
    rowCount?: number;
    duration?: number;
    error?: string;
    data?: any;
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    
    console.log(\`[QueryLog] \${entry.action}:\`, logEntry);
    
    // Send to backend log server using sendBeacon
    try {
      const blob = new Blob([JSON.stringify(logEntry)], { type: ''application/json'' });
      const sent = navigator.sendBeacon(''http://localhost:3001/log'', blob);
      
      if (!sent) {
        // Fallback to fetch
        fetch(''http://localhost:3001/log'', {
          method: ''POST'',
          headers: { ''Content-Type'': ''application/json'' },
          body: JSON.stringify(logEntry),
          keepalive: true
        }).catch(err => console.error(''[QueryLog] Fetch failed:'', err));
      }
    } catch (error) {
      console.error(''[QueryLog] Failed to send log:'', error);
    }
  }

  // Utility methods
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearBuffer() {
    this.logBuffer = [];
  }

  setMinLogLevel(level: LogLevel) {
    this.minLogLevel = level;
  }
}

export const logger = new LoggingService();
\`\`\`

## Backend Log Server (Node.js/Express)

\`\`\`javascript
// server/index.js or log-server.js
import express from ''express'';
import cors from ''cors'';
import fs from ''fs/promises'';
import path from ''path'';

const app = express();
const PORT = 3001;
const LOG_FILE = path.join(process.cwd(), ''query-logs.json'');

app.use(cors());
app.use(express.json());

// Initialize log file
if (!fs.existsSync(LOG_FILE)) {
  await fs.writeFile(LOG_FILE, ''[]'', ''utf8'');
}

app.post(''/log'', async (req, res) => {
  try {
    const logEntry = req.body;
    
    // Read existing logs
    const data = await fs.readFile(LOG_FILE, ''utf8'');
    const logs = JSON.parse(data || ''[]'');
    
    // Add new entry
    logs.push(logEntry);
    
    // Keep last 100 entries (circular buffer)
    if (logs.length > 100) {
      logs.shift();
    }
    
    // Write back to file
    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), ''utf8'');
    
    console.log(\`Logged: \${logEntry.action}\`);
    res.json({ success: true });
  } catch (error) {
    console.error(''Error writing log:'', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Log server running on http://localhost:\${PORT}\`);
  console.log(\`Writing logs to: \${LOG_FILE}\`);
});
\`\`\`

## Usage Examples

### Application Telemetry

\`\`\`typescript
import { logger } from ''../services/loggingService'';

// Component actions
logger.info(''VM selected'', { vmName: ''vmWINSVR01'' }, ''EnvironmentView'');
logger.warn(''API slow response'', { duration: 5000 }, ''SentinelService'');
logger.error(''Query failed'', error, ''SentinelService'');

// User events
logger.trackEvent(''QueryExecuted'', {
  queryType: ''KQL'',
  duration: 2500,
  rowCount: 150
});

// Performance metrics
logger.trackMetric(''QueryDuration'', 2500, { queryType: ''KQL'' });

// Page navigation
logger.trackPageView(''Dashboard'', { tab: ''environment'' });
\`\`\`

### Query Debugging

\`\`\`typescript
// Log query start
logger.writeQueryLog({
  component: ''EnvironmentView'',
  action: ''LoadSecurityAlerts_Start'',
  computerName: ''vmWINDESKTOP01'',
  query: sentinelQuery
});

// Execute query
const startTime = performance.now();
const result = await executeSentinelQuery(sentinelQuery);

// Log query result
logger.writeQueryLog({
  component: ''EnvironmentView'',
  action: ''LoadSecurityAlerts_Result'',
  computerName: ''vmWINDESKTOP01'',
  rowCount: result.rows.length,
  duration: performance.now() - startTime,
  data: { headers: result.headers, rows: result.rows }
});
\`\`\`

### Console Debugging Helper

\`\`\`typescript
// src/main.tsx
import { logger } from ''./services/loggingService'';

// Expose logger in console
(window as any).acreLogger = {
  getLogs: () => {
    const logs = logger.getRecentLogs();
    console.table(logs);
    return logs;
  },
  clear: () => logger.clearBuffer(),
  setLevel: (level: string) => {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    logger.setMinLogLevel(levels[level] ?? 1);
  }
};

console.log('' Logger available: acreLogger.getLogs()'');
\`\`\`

## Azure Application Insights Setup

### Create Application Insights Resource

\`\`\`bash
# Via Azure CLI
az monitor app-insights component create \
  --app acre-insights \
  --location eastus \
  --resource-group acre-rg \
  --application-type web

# Get connection string
az monitor app-insights component show \
  --app acre-insights \
  --resource-group acre-rg \
  --query connectionString
\`\`\`

### Environment Variables

\`\`\`.env
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx;IngestionEndpoint=https://...
\`\`\`

## Query Logs in Application Insights

### Kusto Queries

\`\`\`kql
// All error logs
traces
| where severityLevel == 3
| project timestamp, message, customDimensions
| order by timestamp desc

// Query execution times
customEvents
| where name == ''QueryExecuted''
| extend duration = todouble(customMeasurements.duration)
| summarize avg(duration), max(duration), min(duration) by bin(timestamp, 1h)

// Component error rates
traces
| where severityLevel >= 2
| summarize count() by tostring(customDimensions.component), bin(timestamp, 1h)
\`\`\`

## Best Practices

 **Use component names**: Always pass component as 3rd parameter  
 **Structure data**: Pass objects, not strings, for searchable properties  
 **Avoid PII**: Never log passwords, tokens, or sensitive user data  
 **Choose appropriate levels**:
  - DEBUG: Detailed diagnostics (dev only)
  - INFO: General informational messages
  - WARN: Potential issues that don''t block execution
  - ERROR: Failures needing attention

 **Query debugging**: Use `writeQueryLog()` for KQL/API query debugging  
 **Event tracking**: Track user actions with `trackEvent()`  
 **Metric tracking**: Track performance with `trackMetric()`  

## Cost Considerations

- **First 5 GB/month**: Free
- **Additional data**: ~$2.30 per GB
- Typical usage: < 1 GB/month (well within free tier)

To reduce data:
- Increase minimum log level (INFO  WARN  ERROR)
- Remove DEBUG logs in production
- Use sampling in Application Insights

## Dependencies

\`\`\`json
{
  "@microsoft/applicationinsights-web": "^2.8.0"
}
\`\`\`

## Installation

\`\`\`bash
npm install @microsoft/applicationinsights-web
\`\`\`

## Troubleshooting

### Logs Not Appearing in Application Insights

1. Check connection string format
2. Wait 1-5 minutes for ingestion
3. Verify network access (not blocked by firewall)
4. Check browser console for initialization errors

### Query Logs Not Writing

1. Ensure backend server is running (`node log-server.js`)
2. Check server is on port 3001
3. Verify CORS allows localhost:3000
4. Check `query-logs.json` file permissions

## Source

Extracted from: **ACRE Project** (Sentinel Data Lake Dashboard)  
Last verified: November 2025  
Status:  Production-ready
