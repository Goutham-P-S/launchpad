import fs from "fs";
import path from "path";

export function generateFrontendScaffold(
  webPath: string,
  frontendPlan: any
) {
  fs.mkdirSync(webPath, { recursive: true });

  const srcPath = path.join(webPath, "src");
  const pagesPath = path.join(srcPath, "pages");
  const componentsPath = path.join(srcPath, "components");
  const apiPath = path.join(srcPath, "api");
  const testsPath = path.join(webPath, "tests");

  fs.mkdirSync(srcPath, { recursive: true });
  fs.mkdirSync(pagesPath, { recursive: true });
  fs.mkdirSync(componentsPath, { recursive: true });
  fs.mkdirSync(apiPath, { recursive: true });
  fs.mkdirSync(testsPath, { recursive: true });

  // =============================
  // 1️⃣ package.json
  // =============================

  fs.writeFileSync(
    path.join(webPath, "package.json"),
    JSON.stringify(
      {
        name: "startup-web",
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite --host 0.0.0.0 --port 3000",
          build: "vite build",
          preview: "vite preview --host --port 3000",
          test: "playwright test"
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          axios: "^1.6.0",
          "react-router-dom": "^6.22.0"
        },
        devDependencies: {
          typescript: "^5.0.0",
          vite: "^5.0.0",
          "@vitejs/plugin-react": "^4.2.0",
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
          "@playwright/test": "^1.44.0"
        }
      },
      null,
      2
    )
  );

  // =============================
  // 2️⃣ tsconfig.json
  // =============================

  fs.writeFileSync(
    path.join(webPath, "tsconfig.json"),
    `
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`
  );

  // =============================
  // 3️⃣ vite.config.ts
  // =============================

  fs.writeFileSync(
    path.join(webPath, "vite.config.ts"),
    `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000
  }
});
`
  );

  // =============================
  // 4️⃣ index.html
  // =============================

  fs.writeFileSync(
    path.join(webPath, "index.html"),
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Startup Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  // =============================
  // 5️⃣ API Client
  // =============================

  fs.writeFileSync(
    path.join(apiPath, "client.ts"),
    `
import axios from "axios";

const baseURL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:4000";

export const api = axios.create({
  baseURL
});
`
  );

  // =============================
  // 6️⃣ DataTable Component
  // =============================

  fs.writeFileSync(
    path.join(componentsPath, "DataTable.tsx"),
    `
import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Props {
  endpoint: string;
}

export default function DataTable({ endpoint }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(endpoint)
      .then(res => {
        setData(res.data?.data || []);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [endpoint]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <table border={1} cellPadding={6}>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{JSON.stringify(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`
  );

  // =============================
  // 7️⃣ App.tsx
  // =============================

  fs.writeFileSync(
    path.join(srcPath, "App.tsx"),
    `
import AppRoutes from "./routes";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Startup Dashboard</h1>
      <AppRoutes />
    </div>
  );
}
`
  );

  // =============================
  // 8️⃣ main.tsx
  // =============================

  fs.writeFileSync(
    path.join(srcPath, "main.tsx"),
    `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  );

  // =============================
  // 9️⃣ Routes Generator
  // =============================

  const routeImports = frontendPlan.routes
    .map((r: any) =>
      `import ${r.entity}Page from "./pages/${r.entity}Page";`
    )
    .join("\n");

  const routeElements = frontendPlan.routes
    .map((r: any) =>
      `<Route path="${r.path}" element={<${r.entity}Page />} />`
    )
    .join("\n");

  fs.writeFileSync(
    path.join(srcPath, "routes.tsx"),
    `
import { BrowserRouter, Routes, Route } from "react-router-dom";
${routeImports}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        ${routeElements}
      </Routes>
    </BrowserRouter>
  );
}
`
  );

  // =============================
  // 🔟 Playwright Config
  // =============================

  fs.writeFileSync(
    path.join(webPath, "playwright.config.ts"),
    `
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000'
  }
});
`
  );

  fs.writeFileSync(
  path.join(testsPath, "smoke.spec.ts"),
`
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Startup Dashboard');
});
`
);


  console.log("🌐 Frontend scaffold generated successfully");
}
