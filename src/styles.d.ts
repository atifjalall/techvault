// Type declarations for CSS imports in the project
// This prevents TypeScript from complaining about side-effecting CSS imports like `import './globals.css'`.

declare module "*.css";
declare module "*.scss";
declare module "*.sass";
