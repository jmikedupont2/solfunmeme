# Witness Button - Bug Reporting System

## What It Does

A floating eye button (bottom-right corner) that captures complete browser state and copies it as a data URL you can paste in chat.

## Features

### Captures:
- ✅ All JavaScript errors (stored in `window.__errorLog`)
- ✅ All console.error calls (stored in `window.__consoleLog`)
- ✅ Current URL and timestamp
- ✅ Browser info (userAgent, viewport size)
- ✅ Performance metrics (navigation, resources)
- ✅ localStorage contents
- ✅ DOM state (title, body classes, loaded scripts)

### How to Use:

1. **Reproduce the bug** - Navigate to the page with issues
2. **Click the eye button** (bottom-right, purple, pulsing)
3. **Data URL copied to clipboard** automatically
4. **Paste in chat** - I can decode and analyze it

## Data Format

```
data:application/json;base64,<base64-encoded-json>
```

The JSON contains:
```json
{
  "timestamp": 1769370545540,
  "url": "http://localhost:3001/p0wn",
  "userAgent": "Mozilla/5.0...",
  "viewport": { "width": 1920, "height": 1080 },
  "errors": [
    {
      "message": "WalletNotReadyError",
      "stack": "...",
      "timestamp": 1769370545540
    }
  ],
  "console": [...],
  "performance": {...},
  "localStorage": {...},
  "dom": {...}
}
```

## Current Issues Being Tracked

### 1. Hydration Mismatch (AnimatedLogo)
- **Location**: Header/Footer logo
- **Cause**: SVG path `d` attributes differ between server/client render
- **Impact**: Cosmetic warning, not breaking
- **Fix**: Make logo client-only or use fixed paths

### 2. WalletNotReadyError
- **Location**: P0WN page
- **Cause**: Wallet adapter tries to connect before wallet extension loaded
- **Impact**: Expected behavior when no wallet installed
- **Fix**: Not a bug - add better UX messaging

## Telemetry Flow

```
Browser Error → ErrorReporter → window.__errorLog → WitnessButton → Data URL → Clipboard → Chat
```

## Files Modified

- `src/components/WitnessButton/index.tsx` - New floating button
- `src/components/ErrorReporter/index.tsx` - Store errors in window
- `src/app/layout.tsx` - Add WitnessButton to root layout

## Testing

Visit any page and click the eye button. You should see:
```
✅ Witness captured and copied to clipboard!
Paste it in chat.
```

Then paste the data URL here for analysis.
