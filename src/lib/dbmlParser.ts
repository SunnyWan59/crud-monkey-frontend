type ParsedColumn = {
  name: string;
  type: string;
  refTable?: string;
};

type ParsedTable = {
  name: string;
  columns: ParsedColumn[];
};

const DBML_TO_FIELD_TYPE: Record<string, string> = {
  int: "integer",
  integer: "integer",
  serial: "integer",
  bigint: "integer",
  smallint: "integer",
  varchar: "varchar(255)",
  "varchar(255)": "varchar(255)",
  char: "varchar(255)",
  string: "varchar(255)",
  text: "text",
  longtext: "text",
  boolean: "boolean",
  bool: "boolean",
  date: "date",
  timestamp: "timestamp",
  datetime: "timestamp",
  timestamptz: "timestamp",
  decimal: "decimal",
  numeric: "decimal",
  float: "float",
  double: "float",
  real: "float",
};

const REF_PATTERN = /ref:\s*>\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/i;
const REF_LINE_PATTERN = /^\s*Ref:\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*>\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*$/i;

function mapDbmlType(rawType: string): string {
  const normalized = rawType.toLowerCase().trim();
  return DBML_TO_FIELD_TYPE[normalized] ?? "varchar(255)";
}

export function parseDbml(content: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const refs: { fromTable: string; fromCol: string; toTable: string; toCol: string }[] = [];
  const tableBlockRegex = /Table\s+([a-zA-Z0-9_.]+)\s*\{([^}]*)\}/gs;
  let match: RegExpExecArray | null;
  const seenTableNames = new Set<string>();

  while ((match = tableBlockRegex.exec(content)) !== null) {
    const tableName = match[1].split(".").pop() ?? match[1];
    const blockContent = match[2];
    const columns: ParsedColumn[] = [];
    const lines = blockContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const colMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+(\S+)(?:\s+\[([^\]]*)\])?/);
      if (!colMatch) continue;

      const colName = colMatch[1];
      const colTypeRaw = colMatch[2];
      const settings = colMatch[3] ?? "";
      const refInline = settings.match(REF_PATTERN);
      const colType = mapDbmlType(colTypeRaw);

      const col: ParsedColumn = {
        name: colName,
        type: refInline ? "foreign_key" : colType,
        refTable: refInline ? refInline[1] : undefined,
      };
      columns.push(col);
    }

    if (seenTableNames.has(tableName)) {
      const existing = tables.find((t) => t.name === tableName);
      if (existing) {
        existing.columns.push(...columns);
      }
    } else {
      seenTableNames.add(tableName);
      tables.push({ name: tableName, columns });
    }
  }

  const refLines = content.split("\n");
  for (const line of refLines) {
    const refMatch = line.match(REF_LINE_PATTERN);
    if (refMatch) {
      refs.push({
        fromTable: refMatch[1],
        fromCol: refMatch[2],
        toTable: refMatch[3],
        toCol: refMatch[4],
      });
    }
  }

  for (const ref of refs) {
    const fromTable = tables.find((t) => t.name === ref.fromTable);
    if (!fromTable) continue;
    const col = fromTable.columns.find((c) => c.name === ref.fromCol);
    if (col) {
      col.type = "foreign_key";
      col.refTable = ref.toTable;
    }
  }

  return tables;
}

export type DbmlNodeInput = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    name: string;
    fields: { name: string; type: string; foreignKey?: string }[];
    endpoints: never[];
  };
};

export function dbmlToNodes(content: string): DbmlNodeInput[] {
  const parsed = parseDbml(content);
  const tableNameToId: Record<string, string> = {};
  const nodeSpacing = 350;

  parsed.forEach((t, i) => {
    tableNameToId[t.name] = `dbml-${t.name}-${i}`;
  });

  return parsed.map((table, idx) => {
    const nodeId = tableNameToId[table.name];
    const fields = table.columns.map((col) => {
      const field: { name: string; type: string; foreignKey?: string } = {
        name: col.name,
        type: col.type,
      };
      if (col.type === "foreign_key" && col.refTable) {
        field.foreignKey = tableNameToId[col.refTable];
      }
      return field;
    });

    return {
      id: nodeId,
      type: "modelNode",
      position: { x: 50 + (idx % 3) * nodeSpacing, y: 50 + Math.floor(idx / 3) * 200 },
      data: {
        name: table.name,
        fields,
        endpoints: [],
      },
    };
  });
}
