# ChurnBuster Windows Runner (No-pkg version)

Since `pkg` packaging is having issues, we're providing a simple runner that requires Node.js installed.

## Quick Start (User Side)

### Option 1: With Node.js installed (Recommended for now)
1. Install Node.js 18+ from https://nodejs.org
2. Extract the zip file
3. Run `run.bat` (double-click)

### Option 2: Without Node.js
We'll provide a pre-built .exe once pkg issues are resolved. For immediate use, user can install Node.js.

## Distribution Package Structure

```
churnbuster-v1.0.0.zip
├── src/                    # Source files
├── data/                   # Service data
├── templates/              # Report templates
├── payment/               # QR codes (for sales page)
├── README.md
├── README-ZH.md
├── run.bat                # Windows launcher
├── package.json
└── SALES_PAGE.html        # Sales page (separate)
```

## Build Script Update

The build.js script now creates a simple zip without pkg. Let's update it:
