const fs = require("fs");
const path = require("path");

const PRISMA_FILE = path.join(__dirname, "D:/Safaren/Trabajo/'Mi empresa'/JGLCars-backend/prisma/schema.prisma");
const OUTPUT_FILE = path.join(__dirname, "D:/Safaren/Trabajo/'Mi empresa'/JGLCars-backend/src/types/prisma-types.ts");

// Map Prisma scalar types → TypeScript types
const typeMap = {
  String: "string",
  Int: "number",
  Float: "number",
  Boolean: "boolean",
  DateTime: "string", // Prisma devuelve ISO strings por JSON
};

// Read prisma schema
const prismaSchema = fs.readFileSync(PRISMA_FILE, "utf8");

// Extract enums ‍‍‍‍‍‍
const enumRegex = /enum\s+(\w+)\s+{([^}]+)}/g;
let enums = {};
let enumMatch;
while ((enumMatch = enumRegex.exec(prismaSchema)) !== null) {
  const enumName = enumMatch[1];
  const values = enumMatch[2]
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  enums[enumName] = values;
}

// Extract models
const modelRegex = /model\s+(\w+)\s+{([^}]+)}/g;
let models = {};
let match;

while ((match = modelRegex.exec(prismaSchema)) !== null) {
  const modelName = match[1];
  const body = match[2];

  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("@") && !l.startsWith("//"));

  models[modelName] = lines.map((line) => {
    const [field, prismaTypeRaw] = line.split(/\s+/);
    const prismaType = prismaTypeRaw.split("@")[0];

    return { field, prismaType };
  });
}

// Convert Prisma Type → TS Type
function prismaTypeToTs(type) {
  let isArray = type.endsWith("[]");
  if (isArray) type = type.replace("[]", "");

  let isNullable = type.endsWith("?");
  if (isNullable) type = type.replace("?", "");

  let tsType =
    typeMap[type] ||
    (enums[type] ? enums[type].map((v) => `"${v}"`).join(" | ") : type);

  if (isArray) tsType += "[]";
  if (isNullable) tsType += " | null";

  return tsType;
}

// Build TS output
let output = "// AUTO-GENERATED FROM PRISMA SCHEMA\n\n";

Object.entries(models).forEach(([modelName, fields]) => {
  output += `export interface ${modelName} {\n`;

  fields.forEach(({ field, prismaType }) => {
    const tsType = prismaTypeToTs(prismaType);
    output += `  ${field}: ${tsType};\n`;
  });

  output += "}\n\n";
});

// Write file
fs.writeFileSync(OUTPUT_FILE, output);

console.log("✔ prisma-types.ts generado correctamente");
console.log(`Ruta: ${OUTPUT_FILE}`);
