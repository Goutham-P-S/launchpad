import { llamaChat } from "../llamaClient";
import { ComponentIR, FrontendIR, PageIR } from "./frontendIR";

function extractJSON(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

export async function planFrontendPages(
  backendPlan: any
): Promise<FrontendIR> {

  const system = `
You are a frontend architect.

Only output JSON.
Do not include explanations.
Allowed component types:
- DataTable
- CreateForm
- EditForm
- DeleteAction
- Navbar

Return format:
{
  "pages": [
    {
      "name": "ProductPage",
      "route": "/products",
      "entity": "Product"
    }
  ]
}
`;

  const response = await llamaChat({
    system,
    user: JSON.stringify({
      entities: backendPlan.entities.map((e: any) => e.name)
    }),
    temperature: 0
  });

  const parsed = extractJSON(response);

  const pages: PageIR[] = parsed.pages.map((p: any) => ({
    ...p,
    endpoint: `/api/${p.entity.toLowerCase()}s`,
    components: []
  }));

  return { pages };
}

export async function enrichPageComponents(
  page: PageIR
): Promise<ComponentIR[]> {

  const system = `
You are a frontend architect.

Only output JSON.
Allowed component types:
- DataTable
- CreateForm
- EditForm
- DeleteAction
- Navbar

Return format:
{
  "components": [
    { "type": "DataTable" }
  ]
}
`;

  const response = await llamaChat({
    system,
    user: JSON.stringify({
      entity: page.entity,
      endpoint: page.endpoint
    }),
    temperature: 0
  });

  const parsed = extractJSON(response);
  return parsed.components;
}
