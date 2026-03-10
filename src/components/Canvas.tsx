"use client";

import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Save, Loader2 } from "lucide-react";
import { ModelNode, CrudConfig } from "@/components/ModelNode";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { Checkbox } from "@/components/Checkbox";
import { useLoadingStateRequest } from "@/hooks/useLoadingStateRequest";

const nodeTypes = {
  modelNode: ModelNode,
};

export const Canvas = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  const { execute: saveSchema, isLoading: isSavingSchema } = useLoadingStateRequest("http://localhost:8000/api/save-schema/", "POST");
  const { execute: saveCrud, isLoading: isSavingCrud } = useLoadingStateRequest("http://localhost:8000/api/save-crud/", "POST");

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  useEffect(() => {
    const generatedEdges: Edge[] = [];
    nodes.forEach((node) => {
      node.data.fields?.forEach((field: any) => {
        if (field.type === "foreign_key" && field.foreignKey) {
          generatedEdges.push({
            id: `e-${node.id}-${field.foreignKey}-${field.name}`,
            source: node.id,
            target: field.foreignKey,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
          });
        }
      });
    });
    setEdges(generatedEdges);
  }, [nodes]);

  const handleUpdateNode = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: Math.random().toString(),
      type: "modelNode",
      position: { x: 100, y: 100 },
      data: { 
        name: "NewModel", 
        fields: [], 
        crud: { create: false, read: false, update: false, delete: false },
        updateNode: handleUpdateNode 
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = () => {
    const payload = { nodes, edges };
    
    saveSchema(payload)
      .then(() => {
        return saveCrud(payload);
      })
      .then(() => {
        alert("Progress saved successfully!");
      })
      .catch((err) => {
        alert("Failed to save: " + err.message);
      });
  };

  const onNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setMenu({
      id: node.id,
      top: event.clientY,
      left: event.clientX,
    });
  };

  const onPaneClick = () => {
    setMenu(null);
  };

  const isSaving = isSavingSchema || isSavingCrud;

  return (
    <div className="flex-1 w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-md shadow-md flex flex-col gap-2">
        <Text variant="heading" className="block">Schema Builder</Text>
        <div className="flex gap-2">
          <Button onClick={handleAddNode} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Model
          </Button>
          <Button variant="secondary" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isSaving && <Save className="h-4 w-4" />}
            {isSaving && "Saving..."}
            {!isSaving && "Save Progress"}
          </Button>
        </div>
      </div>
      
      {menu && (
        <div 
          className="absolute z-50 bg-white border border-gray-300 shadow-lg rounded-md p-3 flex flex-col gap-3"
          style={{ top: menu.top, left: menu.left }}
        >
          <Text variant="label" className="font-bold">CRUD Endpoints</Text>
          {(['create', 'read', 'update', 'delete'] as (keyof CrudConfig)[]).map(op => {
             const node = nodes.find(n => n.id === menu.id);
             const val = node?.data?.crud?.[op] || false;
             return (
               <div key={op} className="flex items-center gap-2">
                 <Checkbox 
                   checked={val} 
                   onChange={(e) => {
                     const currentCrud = node?.data?.crud || { create: false, read: false, update: false, delete: false };
                     handleUpdateNode(menu.id, { 
                       crud: { ...currentCrud, [op]: e.target.checked } 
                     });
                   }} 
                 />
                 <Text variant="body" className="capitalize">{op}</Text>
               </div>
             );
          })}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
