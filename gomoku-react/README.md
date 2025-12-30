# Gomoku React

A premium single-page Gomoku (Five-in-a-Row) game built with React and Vite. Features a polished UI, 3D stone effects, and an intelligent AI opponent with multiple difficulty levels.

## Features
- **PvP & PvE Modes**: Play against a friend or the computer.
- **Adjustable Difficulty**: Easy, Medium, and Hard AI settings.
- **Responsive Design**: Elegant wooden board aesthetic.
- **Automated Testing**: Comprehensive test suite using Vitest.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing
Run the test suite:
```bash
npm test
# or
npx vitest run
```

## Local Deployment (Release)

To build and preview the production-ready application locally:

1. **Build the Project**
   Generate the optimized static assets in the `dist/` folder:
   ```bash
   npm run build
   ```

2. **Preview the Build**
   Spin up a local static server to test the production build:
   ```bash
   npm run preview
   ```
   This will typically run on [http://localhost:4173](http://localhost:4173).

3. **Deploy**
   The contents of the `dist/` folder can now be deployed to any static hosting service (e.g., Vercel, Netlify, GitHub Pages, or an S3 bucket).
