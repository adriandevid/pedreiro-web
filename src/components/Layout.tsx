'use client';

import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Controls, Handle, MiniMap, Position, ReactFlow } from "@xyflow/react"
import Sidebar from "./Sidebar"
import { useCallback, useState } from "react";
import { Database, Dot, FileCode, Globe, X } from "lucide-react";

const nodeTypes = {
    textUpdater: TextUpdaterNode,
};

export function TextUpdaterNode(props: any) {
    const onChange = useCallback((evt: any) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className="text-updater-node">
            <div className="relative bg-white border border-1 border-gray-100 shadow-sm p-4 flex flex-col gap-4 rounded-lg w-[20rem]">
                <div className="flex items-center gap-2">
                    <div className="bg-sky-100 p-2 rounded-lg">
                        <Globe size={16} />
                    </div>
                    <p className="text-md font-bold">web-frontend</p>
                </div>
                <p className="flex text-sm text-gray-400">Service <Dot></Dot> React</p>
                <span className="bg-green-500 w-2 h-2 rounded-full absolute right-4"></span>
            </div>
            <Handle type="target" position={Position.Top} style={{
                background: 'none',
                border: 'none',
                width: '1em',
                height: '1em',
            }}
            >
                <div
                    style={{
                        pointerEvents: 'none',
                        left: 0,
                        top: 0,
                        position: 'absolute',
                    }}
                >
                    <div className="bg-blue-200 w-3 h-3 rounded-full p-2 flex items-center justify-center">
                        <div className="bg-white p-1 rounded-full"></div>
                    </div>
                </div>
            </Handle>
            <Handle type="source" position={Position.Right} id="a" style={{
                background: 'none',
                border: 'none',
                width: '1em',
                height: '1em',
            }}
            >
                <div
                    style={{
                        pointerEvents: 'none',
                        left: 0,
                        top: 0,
                        position: 'absolute',
                    }}
                >
                    <div className="bg-blue-200 w-3 h-3 rounded-full p-2 flex items-center justify-center">
                        <div className="bg-white p-1 rounded-full"></div>
                    </div>
                </div>
            </Handle>
            <Handle type="source" position={Position.Bottom} id="b"
                style={{
                    background: 'none',
                    border: 'none',
                    width: '1em',
                    height: '1em',
                }}
            >
                <div
                    style={{
                        pointerEvents: 'none',
                        left: 0,
                        top: 0,
                        position: 'absolute',
                    }}
                >
                    <div className="bg-blue-200 w-3 h-3 rounded-full p-2 flex items-center justify-center">
                        <div className="bg-white p-1 rounded-full"></div>
                    </div>
                </div>
            </Handle>
        </div>
    );
}

const initialNodes = [
    { id: '1', type: 'textUpdater', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: '2', type: 'textUpdater', position: { x: 0, y: 200 }, data: { label: 'Node 2' } },
];
const initialEdges: any[] = [
    //{ id: '1-2', source: '1',  sourceHandle: 'b', target: '2' }
];
const defaultViewport = { x: 100, y: 100, zoom: 1.2 };

export default function Layout() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);


    const onNodesChange = useCallback(
        (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    return (
        <div className="flex h-[100vh]">
            <Sidebar></Sidebar>
            <main className="bg-[#f7f8fa] w-full">
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    defaultViewport={defaultViewport}

                >
                    <Controls />
                    <MiniMap />
                    <Background gap={12} color="rgba(153, 161, 175, 0.44)" size={1} variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </main>
            <aside className="fixed right-0 bg-white h-full w-[30rem] max-h-[100vh] overflow-y-auto pb-10">
                <div className="flex justify-between items-center border-b-solid border-b-1 border-b-gray-100 p-5">
                    <p className="font-bold text-lg">Register Resource</p>
                    <X></X>
                </div>
                <div className="px-4 py-10 flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <label htmlFor="" className="text-sm font-[500] text-gray-600">Resource Name</label>
                        <input defaultValue={"users-db"} type="text" className=" px-4 w-full h-[3rem] rounded-lg border border-1 border-gray-100" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="" className="text-sm font-[500] text-gray-600">Resource Name</label>
                        <div className="flex gap-2 p-4 rounded-lg border border-1 border-gray-100">
                            <Database size={17} />
                            <select name="" id="" className="flex-1">
                                <option value="">Database</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="" className="text-sm font-[500] text-gray-600">Docker Image</label>
                        <input defaultValue={"postgres:14-alpine"} type="text" className=" px-4 w-full h-[3rem] rounded-lg border border-1 border-gray-100" />
                    </div>
                </div>
                <div className="px-4">
                    <p className="font-bold text-md">Configuration File</p>
                    <div className="flex border-b-solid border-b-2 border-b-gray-100 mt-4">
                        <div className="border-b-solid border-b-4 border-b-blue-400 px-5 py-2">
                            <p className="text-sm">docker-compose.yml</p>
                        </div>
                        <div className="px-5 py-2">
                            <p className="text-sm">service.yml</p>
                        </div>
                        <div className=" px-5 py-2">
                            <p className="text-sm">deployment.yml</p>
                        </div>
                    </div>
                    <pre className="mt-5 bg-blue-100 h-full w-full rounded-lg max-w-[30rem] overflow-x-auto">
                        <p className="flex items-center gap-2 text-gray-500  p-4 border-b-solid border-b-1 border-b-gray-300 text-sm"><FileCode />docker-compose.yml</p>
                        <p className="px-4 text-gray-600 text-sm">{
                            `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myschoolgatewayservice-deployment
  labels:
    app: myschoolgatewayservice
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myschoolgatewayservice
  template:
    metadata:
      labels:
        app: myschoolgatewayservice
    spec:
      containers:
        - name: myschoolgatewayservice
          image: 212.85.1.77:5000/myschoolgatewayservice:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
      imagePullSecrets:
        - name: myregistrykey
                            `}</p>
                    </pre>
                </div>
            </aside>
        </div>
    )
}