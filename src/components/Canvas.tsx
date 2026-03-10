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
import { Plus, Save, Loader2, X, Folder, Link2, Trash2 } from "lucide-react";
import { ModelNode, Endpoint } from "@/components/ModelNode";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Badge } from "@/components/Badge";
import { useLoadingStateRequest } from "@/hooks/useLoadingStateRequest";

const nodeTypes = {
  modelNode: ModelNode,
};

export const Canvas = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [editingEndpoint, setEditingEndpoint] = useState<{ nodeId: string; endpoint: Endpoint } | null>(null);

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
        endpoints: [],
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

  const getAllEndpoints = (excludeNodeId?: string, excludeEndpointId?: string): Endpoint[] => {
    return nodes.flatMap((n) => {
      const eps = n.data.endpoints || [];
      if (excludeNodeId && n.id === excludeNodeId) {
        return eps.filter((ep: Endpoint) => ep.id !== excludeEndpointId);
      }
      return eps;
    });
  };

  const isDuplicateEndpoint = (type: string, path: string, nodeId: string, endpointId?: string): boolean => {
    const normalizedPath = path.replace(/\/+$/, "").replace(/^\//, "") || "/";
    const allEps = getAllEndpoints(nodeId, endpointId);
    return allEps.some((ep) => {
      const epPath = ep.path.replace(/\/+$/, "").replace(/^\//, "") || "/";
      return ep.type === type && epPath === normalizedPath;
    });
  };

  const handleDeleteEndpoint = (nodeId: string, endpointId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const newEndpoints = (node.data.endpoints || []).filter((ep: Endpoint) => ep.id !== endpointId);
      handleUpdateNode(nodeId, { endpoints: newEndpoints });
      setEditingEndpoint((prev) =>
        prev && prev.nodeId === nodeId && prev.endpoint.id === endpointId ? null : prev
      );
    }
  };

  const isSaving = isSavingSchema || isSavingCrud;

  return (
    <div className="flex w-full h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-gray-100">
          <Folder className="w-4 h-4 text-gray-500" />
          <Text variant="label" className="font-bold">Endpoints</Text>
        </div>
        <div className="p-2 flex flex-col gap-1 overflow-y-auto">
          {nodes.flatMap((n) =>
            (n.data.endpoints || []).map((ep: Endpoint) => (
              <div
                key={ep.id}
                className="flex items-start justify-between gap-1 p-2 hover:bg-gray-100 rounded-md cursor-pointer border border-transparent hover:border-gray-200 group"
                onClick={() => setEditingEndpoint({ nodeId: n.id, endpoint: ep })}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex gap-2 items-center">
                    <Badge variant="success" className="text-[10px] px-1 py-0 shrink-0">{ep.type}</Badge>
                    <Text variant="body" className="text-xs font-medium truncate">{ep.path}</Text>
                  </div>
                  <Text variant="body" className="text-[10px] text-gray-500 mt-1">Model: {n.data.name}</Text>
                </div>
                <Button
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEndpoint(n.id, ep.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
          {nodes.flatMap(n => n.data.endpoints || []).length === 0 && (
            <Text variant="body" className="text-xs text-gray-400 p-2 text-center">No endpoints created yet</Text>
          )}
        </div>
      </div>

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
            className="fixed z-50 bg-white border border-gray-300 shadow-lg rounded-md p-1 flex flex-col min-w-[150px]"
            style={{ top: menu.top, left: menu.left }}
          >
            <div 
              className="px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-md flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const node = nodes.find(n => n.id === menu.id);
                if (node) {
                  setEditingEndpoint({
                    nodeId: node.id,
                    endpoint: {
                      id: Math.random().toString(),
                      type: "GET",
                      path: `/api/${node.data.name.toLowerCase()}`
                    }
                  });
                }
                setMenu(null);
              }}
            >
              <Plus className="w-4 h-4" />
              Create Endpoint
            </div>
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

      {/* Right Sidebar */}
      {editingEndpoint && (
        <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-100">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-gray-500" />
              <Text variant="label" className="font-bold">Edit Endpoint</Text>
            </div>
            <div className="text-gray-500 hover:text-gray-800 cursor-pointer" onClick={() => setEditingEndpoint(null)}>
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Text variant="label" className="text-xs font-bold text-gray-600">Model</Text>
              <Text variant="body" className="text-sm">{nodes.find(n => n.id === editingEndpoint.nodeId)?.data.name}</Text>
            </div>
            <div className="flex flex-col gap-1">
              <Text variant="label" className="text-xs font-bold text-gray-600">Method</Text>
              <Select 
                value={editingEndpoint.endpoint.type}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, endpoint: { ...editingEndpoint.endpoint, type: e.target.value } })}
                className="h-8"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Text variant="label" className="text-xs font-bold text-gray-600">Path</Text>
              <Input 
                value={editingEndpoint.endpoint.path}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, endpoint: { ...editingEndpoint.endpoint, path: e.target.value } })}
                className="h-8"
              />
            </div>
            <Button 
              className="mt-2" 
              onClick={() => {
                const node = nodes.find((n) => n.id === editingEndpoint.nodeId);
                if (!node) return;
                const { type, path } = editingEndpoint.endpoint;
                if (isDuplicateEndpoint(type, path, editingEndpoint.nodeId, editingEndpoint.endpoint.id)) {
                  alert("An endpoint with this method and path already exists.");
                  return;
                }
                const existingEndpoints = node.data.endpoints || [];
                const isExisting = existingEndpoints.some((ep: Endpoint) => ep.id === editingEndpoint.endpoint.id);
                const newEndpoints = isExisting
                  ? existingEndpoints.map((ep: Endpoint) => (ep.id === editingEndpoint.endpoint.id ? editingEndpoint.endpoint : ep))
                  : [...existingEndpoints, editingEndpoint.endpoint];
                handleUpdateNode(node.id, { endpoints: newEndpoints });
                setEditingEndpoint(null);
              }}
            >
              Save Endpoint
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
