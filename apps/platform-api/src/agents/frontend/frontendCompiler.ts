import fs from "fs";
import path from "path";
import { FrontendIR } from "./frontendIR";

export function compileFrontend(
  webPath: string,
  ir: FrontendIR
) {

  const pagesDir = path.join(webPath, "src/pages");
  fs.mkdirSync(pagesDir, { recursive: true });

  for (const page of ir.pages) {

    const imports: string[] = [];
    const body: string[] = [];

    if (page.components.some(c => c.type === "DataTable")) {
      imports.push(`import DataTable from "../components/DataTable";`);
      body.push(
        `<DataTable endpoint="${page.endpoint}" />`
      );
    }

    const content = `
${imports.join("\n")}

export default function ${page.name}() {
  return (
    <div>
      <h2>${page.entity}</h2>
      ${body.join("\n")}
    </div>
  );
}
`;

    fs.writeFileSync(
      path.join(pagesDir, `${page.name}.tsx`),
      content
    );
  }
}
