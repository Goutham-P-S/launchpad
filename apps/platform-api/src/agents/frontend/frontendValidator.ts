import { FrontendIR } from "./frontendIR";

const ALLOWED_COMPONENTS = [
  "DataTable",
  "CreateForm",
  "EditForm",
  "DeleteAction",
  "Navbar"
];

export function validateFrontendIR(ir: FrontendIR, backendPlan: any) {

  const backendEntities = new Set(
    backendPlan.entities.map((e: any) => e.name)
  );

  for (const page of ir.pages) {

    if (!backendEntities.has(page.entity)) {
      throw new Error(`Unknown entity ${page.entity}`);
    }

    for (const comp of page.components) {
      if (!ALLOWED_COMPONENTS.includes(comp.type)) {
        throw new Error(`Invalid component ${comp.type}`);
      }
    }
  }

  return true;
}
