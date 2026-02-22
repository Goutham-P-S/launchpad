export interface FrontendIR {
  pages: PageIR[];
}

export interface PageIR {
  name: string;
  route: string;
  entity: string;
  endpoint: string;
  components: ComponentIR[];
}

export type ComponentIR =
  | { type: "DataTable" }
  | { type: "CreateForm" }
  | { type: "EditForm" }
  | { type: "DeleteAction" }
  | { type: "Navbar" };
