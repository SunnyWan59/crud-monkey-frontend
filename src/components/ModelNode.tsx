import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Plus, X } from "lucide-react";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

export type Field = {
  name: string;
  type: string;
};

export type CrudConfig = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

export type ModelNodeData = {
  name: string;
  fields: Field[];
  crud?: CrudConfig;
  updateNode?: (id: string, data: Partial<ModelNodeData>) => void;
};

export const ModelNode = ({ id, data }: { id: string; data: ModelNodeData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [modelName, setModelName] = useState(data.name);

  const handleAddField = () => {
    const newFields = [...data.fields, { name: "new_field", type: "integer" }];
    if (data.updateNode) {
      data.updateNode(id, { fields: newFields });
    }
  };

  const handleUpdateField = (index: number, key: keyof Field, value: string) => {
    const newFields = [...data.fields];
    newFields[index] = { ...newFields[index], [key]: value };
    if (data.updateNode) {
      data.updateNode(id, { fields: newFields });
    }
  };

  const handleRemoveField = (index: number) => {
    const newFields = data.fields.filter((_, i) => i !== index);
    if (data.updateNode) {
      data.updateNode(id, { fields: newFields });
    }
  };

  const handleSaveName = () => {
    if (data.updateNode) {
      data.updateNode(id, { name: modelName });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-md min-w-[250px] shadow-sm">
      <div className="bg-gray-100 p-2 border-b border-gray-300 rounded-t-md flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {isEditing && (
            <Input 
              value={modelName} 
              onChange={(e) => setModelName(e.target.value)} 
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              autoFocus
              className="h-8 py-1 nodrag"
            />
          )}
          {!isEditing && (
            <div className="flex-1 cursor-text" onClick={() => setIsEditing(true)}>
              <Text variant="label" className="font-bold">{data.name}</Text>
            </div>
          )}
        </div>
        {data.crud && (
          <div className="flex gap-1">
            {data.crud.create && <Badge variant="success">C</Badge>}
            {data.crud.read && <Badge variant="success">R</Badge>}
            {data.crud.update && <Badge variant="success">U</Badge>}
            {data.crud.delete && <Badge variant="success">D</Badge>}
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col gap-2">
        {data.fields.length === 0 && (
          <Text variant="body" className="text-gray-500 italic text-sm">No fields</Text>
        )}
        {data.fields.map((field, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input 
              value={field.name} 
              onChange={(e) => handleUpdateField(idx, "name", e.target.value.replace(/\s/g, "_"))}
              className="h-8 py-1 px-2 text-sm nodrag"
              placeholder="name"
            />
            <Select 
              value={field.type} 
              onChange={(e) => handleUpdateField(idx, "type", e.target.value)}
              className="h-8 py-1 px-2 text-sm nodrag"
            >
              <option value="integer">integer</option>
              <option value="varchar(255)">varchar(255)</option>
              <option value="text">text</option>
              <option value="boolean">boolean</option>
              <option value="date">date</option>
              <option value="timestamp">timestamp</option>
              <option value="decimal">decimal</option>
              <option value="float">float</option>
            </Select>
            <Button variant="danger" className="px-2 py-1 h-8 text-xs nodrag" onClick={() => handleRemoveField(idx)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="secondary" className="w-full mt-2 text-xs py-1 nodrag gap-1 flex items-center justify-center" onClick={handleAddField}>
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};
