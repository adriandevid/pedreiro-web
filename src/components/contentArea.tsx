'use client';

import { CircleSlash, Code, Cpu, Edit, GripVertical, HardDrive, Maximize2, Minus, MousePointer2, Plus, RefreshCw, Settings, Trash, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import MapInterator, { Node } from "./mapInterator";
import { cn } from "@pedreiro-web/util/tailwindmerge";
import { InfrastructureComponent, Log } from "@pedreiro-web/infrastructure/repository/types/infrastructure-component";
import { Application } from "@pedreiro-web/infrastructure/repository/types/application";
import BuildApplication from "@pedreiro-web/app/actions/application/build";
import BuildInfrastructureComponent from "@pedreiro-web/app/actions/infrastructure-component/build";
import DestroyInfrastructureComponent from "@pedreiro-web/app/actions/infrastructure-component/destroy";
import StopInfrastructureComponent from "@pedreiro-web/app/actions/infrastructure-component/stop";
import { Edge } from "@pedreiro-web/infrastructure/repository/types";

export default function ContentArea({
    nodes,
    showNotify,
    setNodes,
    activeTab,
    setActiveTab,
    setShowConfirmModal,
    isLoading,
    setIsDeploying,
    isDeploying,
    editResourceAction,
    dockerComposeDocument,
    localLogOfBuild,
    loadLogsOfService
}: {
    nodes: Node[],
    showNotify: any,
    setNodes: any,
    activeTab: string,
    setActiveTab: any,
    setShowConfirmModal: any,
    loading: boolean,
    isLoading: any,
    setIsDeploying: any,
    isDeploying: boolean,
    editResourceAction: (resourceId: string) => void,
    dockerComposeDocument: string,
    localLogOfBuild: { operation: string, resource: string, logs: Log[] }[],
    loadLogsOfService: any

}) {
    const [scaleMap, setScaleMap] = useState<number>(1.0);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-api');
    const [activeFile, setActiveFile] = useState('docker-compose.yml');

    const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);
    const fileTemplates: any = useMemo(() => ({
        'docker-compose.yml': `version: '3.8'\nservices:\n  api:\n    build: ./backend\n    ports:\n      - "5000:5000"\n    depends_on:\n      - db\n  web:\n    image: nginx:stable\n    ports:\n      - "80:80"\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: example`,
        'deployment.yml': `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend-api\n  template:\n    metadata:\n      labels:\n        app: backend-api\n    spec:\n      containers:\n      - name: api\n        image: backend-image:v1`,
        'Dockerfile': `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 5000\nCMD ["npm", "start"]`,
        'service.yml': `apiVersion: v1\nkind: Service\nmetadata:\n  name: api-service\nspec:\n  selector:\n    app: backend-api\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: 5000`
    }), []);

    const [showContentDetails, setShowContentDetails] = useState<boolean>(false);
    const [activedSelectNode, activeSelectNode] = useState<boolean>(false);

    const contentPage = useRef<any>(null);
    const canvasRef = useRef<any>(null);



    const updatePosition = async (code: number, content: { position_x: number, position_y: number }, type: number) => {
        if (type == 1) {
            const responseRequest = await fetch(`${window.location.href}/api/applications/${code}/update-position`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            })

            const responseResult: Application = await responseRequest.json();
            return responseResult;
        } else if (type == 2) {
            const responseRequest = await fetch(`${window.location.href}/api/infrastructure-component/${code}/update-position`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            })

            const responseResult: InfrastructureComponent = await responseRequest.json();
            return responseResult;
        }
    }

    const createEdge = async (content: { source_id: number, target_id: number }) => {
        const responseRequest = await fetch(`${window.location.href}/api/edges/`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        })

        const responseResult: Edge = await responseRequest.json();
        return responseResult;
    }

    const deleteEdge = async (id: number) => {
        const responseRequest = await fetch(`${window.location.href}/api/edges/${id}`, {
            method: "DELETE"
        })

        if (responseRequest.status == 200) {
            return true;
        }
        return false;
    }

    const [edges, setEdges] = useState<any[]>([]);
    const [tempEdge, setTempEdge] = useState<any>(null);
    // Funções de Conexão
    const startConnect = (nodeId: any, handleSide: any) => {
        setTempEdge({ sourceId: nodeId, handleSide });
    };

    const endConnect = (targetId: any) => {
        if (tempEdge && tempEdge.sourceId !== targetId) {
            const exists = edges.find(e => (e.source === tempEdge.sourceId && e.target === targetId) || (e.source === targetId && e.target === tempEdge.sourceId));
            if (!exists) {
                const newEdge = {
                    id: `e-${Date.now()}`,
                    source: tempEdge.sourceId,
                    target: targetId
                };
                createEdge({ source_id: tempEdge.sourceId, target_id: targetId })
                setEdges(prev => [...prev, newEdge]);
                showNotify("Nova conexão estabelecida");
            }
        }
        setTempEdge(null);
    };

    const removeEdge = (id: any) => {
        deleteEdge(parseInt(`${edges.filter(e => e.id == id)[0].id}`.split("-")[1]))
        setEdges(prev => prev.filter(e => e.id !== id));
        showNotify("Conexão removida");
    };
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const handleMouseMoveCanvas = (e: any) => {
        if (!tempEdge || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleNodeDrag = (id: any, x: any, y: any) => {
        const nodeSelected = nodes.filter(x => x.id == id)[0];
        const rect = canvasRef.current.getBoundingClientRect();
        updatePosition(nodeSelected.code, { position_x: x, position_y: y }, nodeSelected.type == "container" ? 1 : 2);
        setNodes((prev: Node[]) => prev.map(node => node.id === id ? { ...node, position: { x, y } } : node));
    };

    const containerResizeRef = useRef<any>(null);
    const contentDetailsRef = useRef<any>(null);
    const [containerResizePositionMove, setContainerResizeModePosition] = useState<{ x: number, y: number } | undefined>();


    const [stateBuildInfrastructureComponent, formActionBuildInfrastructureComponent, pendingBuildInfrastructureComponent] = useActionState(BuildInfrastructureComponent, undefined);
    const [stateBuildApplication, formActionBuildApplication, pendingBuildApplication] = useActionState(BuildApplication, undefined);
    const [stateStopInfrastructureComponent, formActionStopInfrastructureComponent, pendingStopInfrastructureComponent] = useActionState(StopInfrastructureComponent, undefined);
    const [stateDestroyInfrastructureComponent, formActionDestroyInfrastructureComponent, pendingDestroyInfrastructureComponent] = useActionState(DestroyInfrastructureComponent, undefined);

    useEffect(function () {
        if (stateBuildInfrastructureComponent && stateBuildInfrastructureComponent.status == 200) {
            isLoading(false);
            setIsDeploying(false);
            loadLogsOfService();
        }
    }, [stateBuildInfrastructureComponent])

    useEffect(function () {
        if (stateBuildApplication && stateBuildApplication.status == 200) {
            isLoading(false);
            setIsDeploying(false);
            loadLogsOfService();
        }
    }, [stateBuildApplication])


    const buildInfrastructureComponent = async () => {
        isLoading(true);
        setIsDeploying(true);
        startTransition(function () {
            formActionBuildInfrastructureComponent(selectedNode!.code);
        })
    }

    const buildApplication = async () => {
        isLoading(true);
        setIsDeploying(true);
        startTransition(function () {
            formActionBuildApplication(selectedNode!.code);
        })
    }

    const [stopOperationLoading, setStopOperationLoading] = useState<boolean>(false);
    const [destroyOperationLoading, setDestroyOperationLoading] = useState<boolean>(false);

    const stopInfrastructureComponent = async () => {
        isLoading(true);
        setStopOperationLoading(true);
        setIsDeploying(true);
        startTransition(function () {
            formActionStopInfrastructureComponent(selectedNode!.code);
        })
    }

    const destroyInfrastructureComponent = async () => {
        isLoading(true);
        setDestroyOperationLoading(true);
        setIsDeploying(true);
        startTransition(function () {
            formActionDestroyInfrastructureComponent(selectedNode!.code);
        })
    }

    useEffect(function () {
        if (stateStopInfrastructureComponent && stateStopInfrastructureComponent.status == 200) {
            isLoading(false);
            setStopOperationLoading(false);
            setIsDeploying(false);
        }
    }, [stateStopInfrastructureComponent])

    useEffect(function () {
        if (stateDestroyInfrastructureComponent && stateDestroyInfrastructureComponent.status == 200) {
            isLoading(false);
            setDestroyOperationLoading(false);
            setIsDeploying(false);
        }
    }, [stateDestroyInfrastructureComponent])

    return (
        <div className="flex-1 flex overflow-hidden relative">

            {/* Canvas Arrastável */}
            <div className={`flex-1 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden transition-all duration-500 ${activeTab !== 'nodes-map' ? 'opacity-30 scale-95 pointer-events-none' : 'opacity-100'}`}>
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <button
                        type='button'
                        className="p-2 bg-white shadow-xl border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-transform active:scale-90"
                        onClick={() => {
                            setScaleMap(scaleMap + 0.1);
                        }}
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        type='button'
                        // disabled={scaleMap <= 1.0}
                        className="p-2 bg-white shadow-xl border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-transform active:scale-90"
                        onClick={() => {
                            setScaleMap(scaleMap - 0.1);
                        }}
                    >
                        <Minus size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedNodeId(null);
                            setShowContentDetails(false);
                            activeSelectNode(!activedSelectNode);
                        }}
                        type={'button'}
                        className={cn(
                            "p-2 shadow-xl border border-slate-200 rounded-lg transition-transform cursor-pointer",
                            !activedSelectNode ?
                                "bg-white text-slate-600 hover:bg-slate-50" :
                                "bg-cyan-600 text-white scale-[1.1]"
                        )}
                    >
                        <MousePointer2 size={20} />
                    </button>
                </div>

                {/* Nodes e Conexões */}
                <MapInterator
                    ref={canvasRef}
                    onMouseMove={handleMouseMoveCanvas}
                    onMouseUp={() => setTempEdge(null)}
                    zoom={scaleMap}
                    nodes={nodes}
                    edges={edges}
                    tempEdge={tempEdge}
                    selectedNodeId={selectedNodeId}
                    onClickNode={(nodeId: string) => {
                        setSelectedNodeId(nodeId)
                        setShowContentDetails(true)
                    }}
                    handleNodeDragNode={handleNodeDrag}
                    startConnectNode={startConnect}
                    endConnectNode={endConnect}
                    removeEdgeEvent={removeEdge}
                    mousePos={mousePos}
                ></MapInterator>

                {/* Legenda Flutuante */}
                <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest flex gap-4 z-20">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Service</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-800 border border-cyan-400"></div> Container</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Database</div>
                </div>
            </div>
            {/* Sidebar de Detalhes / Editor */}
            <div ref={contentDetailsRef} style={{ width: "800px" }} data-width={containerResizePositionMove ? containerResizePositionMove.x : 800} hidden={!showContentDetails} className={`relative border-l border-slate-200 bg-white flex flex-col shadow-2xl z-20 transform transition-transform duration-300 animate-fade-in-slide`}>
                <div
                    className='bg-transparent w-5 hover:bg-gray-100 h-full absolute z-[1000] flex justify-center items-center cursor-col-resize text-transparent hover:text-black'
                    ref={containerResizeRef}
                    draggable
                    onDragEnd={(e) => {
                        const rect = contentPage.current.getBoundingClientRect();

                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        setContainerResizeModePosition({
                            x: rect.width - parseInt(x.toFixed(0)),
                            y: parseInt(y.toFixed(0))
                        });
                    }}
                >
                    <GripVertical />
                </div>
                {/* Abas do Editor */}
                <div className="flex bg-slate-50 border-b border-slate-200 p-1 gap-1 overflow-x-auto overflow-y-hidden">
                    {Object.keys(fileTemplates).map(file => (
                        <button
                            key={file}
                            onClick={() => { setActiveFile(file); setActiveTab('files'); }}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${activeFile === file && activeTab === 'files'
                                ? 'bg-white text-cyan-600 shadow-sm border border-slate-200'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {file}
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
                    {selectedNode && activeTab === 'nodes-map' ? (
                        /* Painel de Detalhes do Node Selecionado */
                        <div className="flex-1 p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <span className="p-2 bg-slate-100 rounded-lg text-slate-600"><Settings size={20} /></span>
                                    Configuração do Node
                                </h3>
                                <div className='flex flex-row gap-2'>
                                    <button onClick={() => {
                                        setShowConfirmModal(true);
                                    }} className="p-1 hover:bg-red-100 rounded-full cursor-pointer text-red-400"><Trash size={20} /></button>
                                    <button onClick={() => {
                                        setSelectedNodeId(null)
                                        setShowContentDetails(false);
                                    }} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Métricas Atuais</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Cpu size={14} /> CPU</div>
                                            <div className="text-lg font-bold text-slate-800">{selectedNode.data.cpu}</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><HardDrive size={14} /> RAM</div>
                                            <div className="text-lg font-bold text-slate-800">128MB</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Propriedades</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                                            <span className="text-sm text-slate-500">Identificador</span>
                                            <span className="text-sm font-mono font-bold text-slate-800">{selectedNode.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                                            <span className="text-sm text-slate-500">Uptime</span>
                                            <span className="text-sm font-bold text-green-600">{selectedNode.data.uptime}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    {/* <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                                                <Terminal size={18} /> Abrir Terminal de Node
                                            </button> */}
                                    {
                                        selectedNode.status ?
                                            <div className='flex flex-row gap-4'>
                                                <button
                                                    onClick={() => {
                                                        stopInfrastructureComponent();
                                                    }}
                                                    disabled={stopOperationLoading || destroyOperationLoading}
                                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors cursor-pointer"
                                                >
                                                    {stopOperationLoading ? <RefreshCw size={16} className="animate-spin" /> : <CircleSlash size={16} className="text-cyan-400" />}
                                                    {stopOperationLoading ? 'Stoping...' : 'Stop Deployment'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        destroyInfrastructureComponent();
                                                    }}
                                                    disabled={destroyOperationLoading || stopOperationLoading}
                                                    className="w-full items-center gap-2 flex items-center justify-center  py-3 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer bg-red-600 disabled:bg-red-500 hover:bg-red-700 text-white shadow-red-200"
                                                >
                                                    {destroyOperationLoading ? <RefreshCw size={16} className="animate-spin" /> : <CircleSlash size={16} className="text-white" />}
                                                    {destroyOperationLoading ? 'Destroying...' : 'Destroy Deployment'}
                                                </button>
                                            </div> :
                                            <button
                                                onClick={() => {
                                                    if (selectedNode.id.includes("infra")) {
                                                        buildInfrastructureComponent();
                                                    } else {
                                                        buildApplication();
                                                    }
                                                }}
                                                disabled={isDeploying || destroyOperationLoading || stopOperationLoading}
                                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors cursor-pointer"
                                            >
                                                {isDeploying ? <RefreshCw size={16} className="animate-spin" /> : <Code size={16} className="text-cyan-400" />}
                                                {isDeploying ? 'Deploying...' : 'Deploy'}
                                            </button>
                                    }
                                    <button
                                        type='button'
                                        onClick={async () => {

                                            editResourceAction(selectedNode.id);
                                            /*  if (selectedNode.id.includes("infra")) {
                                                 editResourceAction()
                                                 const serviceResponse = await fetch(`${window.location.href}/api/infrastructure-component/${selectedNode.code}`, { method: "GET" });
                                                 const responseJson: InfrastructureComponent = await serviceResponse.json();
                                                 propsFormUpdateInfrastructureComponent.reset({
                                                     ...responseJson
                                                 });
 
                                                 setShowEditInfrastructureModal(true);
                                             } else {
                                                 const serviceResponse = await fetch(`${window.location.href}/api/applications/${selectedNode.code}`, { method: "GET" });
                                                 const responseJson: Application = await serviceResponse.json();
                                                 propsFormUpdateApplication.reset({
                                                     ...responseJson,
                                                     port: `${responseJson.port}`,
                                                     node_port: `${responseJson.node_port}`,
                                                     target_port: `${responseJson.target_port}`,
                                                     replicas: `${responseJson.replicas}`
                                                 });
 
                                                 setShowEditAppplicationModal(true);
                                             } */
                                        }}
                                        className="w-full py-3 border mt-2 cursor-pointer border-slate-900 text-slate-900 rounded-xl font-bold flex items-center cursor-pointer justify-center gap-2 hover:text-white hover:bg-slate-900 transition-colors"
                                        disabled={isDeploying || destroyOperationLoading || stopOperationLoading}
                                    >
                                        <Edit size={18} /> Editar Serviço
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Editor de Código */
                        <div className="flex-1 relative overflow-hidden group bg-slate-900">
                            <textarea
                                className="w-full h-full p-8 font-mono text-sm bg-slate-900 text-cyan-50/90 outline-none resize-none selection:bg-cyan-500/30 leading-relaxed scrollbar-hide"
                                spellCheck="false"
                                value={dockerComposeDocument}
                            //onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Console Integrado */}
                <div className="p-5 bg-white border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Console de Eventos</span>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-cyan-500">
                            <div className={`w-1.5 h-1.5 rounded-full bg-cyan-500 ${isDeploying ? 'animate-ping' : ''}`}></div>
                            {isDeploying ? 'EXECUTANDO DEPLOY' : 'SISTEMA PRONTO'}
                        </span>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-400 h-40 overflow-y-auto space-y-1.5 shadow-inner border border-slate-800">
                        {isDeploying ? (
                            <>
                                <p className="text-cyan-400 animate-pulse"># Iniciando pipeline de deploy...</p>
                                <p className="text-slate-300">{" >> Building images from Dockerfile"}</p>
                                <p className="text-slate-300">{" >> Pushing to gcr.io/clouddeploy/api:v1.2"}</p>
                                <p className="text-green-500">{" >> Image build success!"}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-500 opacity-80 italic"># Aguardando comandos...</p>
                                <p className="flex gap-2"><span>[14:22:01]</span> <span className="text-slate-500">Ambiente de Produção carregado.</span></p>
                                {
                                    localLogOfBuild.length > 0 ?
                                        localLogOfBuild.map((stream, indexStream) => {
                                            return (
                                                <div key={indexStream}>
                                                    <p>operation: {stream.operation}</p>
                                                    {
                                                        stream.logs.map((log, indexLog) => (
                                                            <div key={indexLog}><p className="flex gap-2 text-cyan-500"><span>{`[${new Date(log.time * 1000).toLocaleDateString()}]`}</span>{log.short_log}</p></div>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        }) :
                                        <></>
                                }
                                {/* {(localLogOfBuild.length > 0) && <p className="flex gap-2 text-cyan-500"><span>[14:25:42]</span> {localLogOfBuild.includes("\n") ? localLogOfBuild.split("\n").map(x => (<>{x} <br/></>)): localLogOfBuild}</p>} */}
                            </>
                        )}
                        <p className="text-slate-500 animate-pulse">_</p>
                    </div>
                </div>
            </div>
        </div>
    )
}