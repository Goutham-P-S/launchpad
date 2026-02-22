export function toSingular(name: string) {
  if (name.endsWith("sses")) return name.slice(0, -2);
  if (name.endsWith("ies")) return name.slice(0, -3) + "y";
  if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
  return name;
}

export function toCamel(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function pluralize(name: string) {
  if (name.endsWith("s")) return name.toLowerCase();
  return name.toLowerCase() + "s";
}

export function generatePrismaSchema(plan: any) {
  let schema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

  const modelMap = new Map<string, any>();

  // 1️⃣ Normalize and register models
  for (const entity of plan.entities) {
    const cleanName = toSingular(entity.name);
    modelMap.set(cleanName, {
      ...entity,
      name: cleanName,
      forwardRelations: [] as any[],
      inverseRelations: [] as any[]
    });
  }

  // 2️⃣ Collect and distinct relations
  // The LLM often gives bidirectional relation definitions.
  // We need to deduplicate them. A relation between A and B should only be defined once.
  const processedRelations = new Set<string>();

  for (const entity of modelMap.values()) {
    for (const rel of entity.relations || []) {
      const sourceName = entity.name;
      const targetName = toSingular(rel.target);
      const target = modelMap.get(targetName);
      if (!target) continue;

      // Unique key for the relation pair regardless of direction
      const relKeys = [sourceName, targetName].sort();
      const relationKey = `${relKeys[0]}_${relKeys[1]}`;

      const relationName = relationKey;

      if (processedRelations.has(relationKey)) {
        continue; // Already processed this pair from the other side
      }

      processedRelations.add(relationKey);

      // Determine who holds the Foreign Key. 
      // Rule: For many-to-one, the "many" side holds the FK.
      // For one-to-one, we arbitrarily pick the source side to hold the FK.
      // Note: LLM might say A is many-to-one to B, or B is one-to-many to A. 
      // If rel.type is 'one-to-many', the target holds the FK.

      let fkHolder = entity;
      let inverseHolder = target;
      let isOneToOne = false;

      if (rel.type === "many-to-one") {
        fkHolder = entity;
        inverseHolder = target;
      } else if (rel.type === "one-to-many") {
        fkHolder = target;
        inverseHolder = entity;
      } else if (rel.type === "one-to-one") {
        fkHolder = entity;
        inverseHolder = target;
        isOneToOne = true;
      }

      fkHolder.forwardRelations.push({
        targetName: inverseHolder.name,
        relationName,
        isOneToOne,
      });

      inverseHolder.inverseRelations.push({
        targetName: fkHolder.name,
        relationName,
        isOneToOne,
      });
    }
  }

  // 3️⃣ Build schema strings
  for (const entity of modelMap.values()) {
    schema += `\nmodel ${entity.name} {\n`;
    schema += `  id Int @id @default(autoincrement())\n`;

    const writtenFields = new Set<string>();
    writtenFields.add("id");

    for (const field of entity.fields || []) {
      const nameLowerCase = field.name.toLowerCase();
      if (nameLowerCase === "id" || nameLowerCase.endsWith("id")) continue;

      schema += `  ${field.name} ${field.type}\n`;
      writtenFields.add(field.name);
    }

    // Write Forward relations (holds FK)
    for (const rel of entity.forwardRelations) {
      const camelTarget = toCamel(rel.targetName);
      const fkName = `${camelTarget}Id`;

      if (!writtenFields.has(fkName)) {
        if (rel.isOneToOne) {
          schema += `  ${fkName} Int @unique\n`;
        } else {
          schema += `  ${fkName} Int\n`;
        }
        writtenFields.add(fkName);
      }

      schema += `  ${camelTarget} ${rel.targetName}${rel.isOneToOne ? '?' : ''} @relation("${rel.relationName}", fields: [${fkName}], references: [id])\n`;
    }

    // Write Inverse relations (no FK)
    for (const inv of entity.inverseRelations) {
      const fieldName = inv.isOneToOne ? toCamel(inv.targetName) : pluralize(inv.targetName);
      const type = inv.isOneToOne ? `${inv.targetName}?` : `${inv.targetName}[]`;

      if (!writtenFields.has(fieldName)) {
        schema += `  ${fieldName} ${type} @relation("${inv.relationName}")\n`;
        writtenFields.add(fieldName);
      }
    }

    schema += `}\n`;
  }

  return schema;
}
