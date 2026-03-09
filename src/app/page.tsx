'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef, useActionState, startTransition } from 'react';
import {
  Server,
  Box,
  Layers,
  FileCode,
  Activity,
  Settings,
  Plus,
  Play,
  Terminal,
  Save,
  Database,
  Globe,
  ShieldCheck,
  Zap,
  ChevronRight,
  Maximize2,
  MousePointer2,
  X,
  RefreshCw,
  Cpu,
  HardDrive,
  Download,
  FileJson,
  ImageIcon,
  PlusCircle,
  CheckCircle2,
  Share2
} from 'lucide-react';
import domtoimage from "dom-to-image-more";
import { domToPng } from 'modern-screenshot';
import CustomNode from '@pedreiro-web/components/ui/customNode';
import { Application, ApplicationCreate, ApplicationValidator } from '@pedreiro-web/infrastructure/repository/types/application';
import Create from './actions/application/create';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Edge } from '@pedreiro-web/infrastructure/repository/types';


// --- Aplicação Principal ---

export default function App() {
  const [activeTab, setActiveTab] = useState('nodes-map'); // 'nodes-map' ou 'files'
  const [activeFile, setActiveFile] = useState('docker-compose.yml');
  const [code, setCode] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-api');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Estado dos Nodes para permitir movimento
  const [nodes, setNodes] = useState<any[]>([]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const fileTemplates: any = useMemo(() => ({
    'docker-compose.yml': `version: '3.8'\nservices:\n  api:\n    build: ./backend\n    ports:\n      - "5000:5000"\n    depends_on:\n      - db\n  web:\n    image: nginx:stable\n    ports:\n      - "80:80"\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: example`,
    'deployment.yml': `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend-api\n  template:\n    metadata:\n      labels:\n        app: backend-api\n    spec:\n      containers:\n      - name: api\n        image: backend-image:v1`,
    'Dockerfile': `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 5000\nCMD ["npm", "start"]`,
    'service.yml': `apiVersion: v1\nkind: Service\nmetadata:\n  name: api-service\nspec:\n  selector:\n    app: backend-api\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: 5000`
  }), []);

  useEffect(() => {
    setCode(fileTemplates[activeFile]);
  }, [activeFile, fileTemplates]);

  const updatePosition = async (code: number, content: { position_x: number, position_y: number }) => {
    const responseRequest = await fetch(`${window.location.href}/api/applications/${code}/update-position`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    })

    const responseResult: Application = await responseRequest.json();
    return responseResult;
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

  const listEdges = async () => {
    const responseRequest = await fetch(`${window.location.href}/api/edges`, {
      method: "GET"
    })

    const responseResult: Edge[] = await responseRequest.json();
    return responseResult;
  }

  const handleNodeDrag = (id: any, x: any, y: any) => {
    updatePosition(nodes.filter(x => x.id == id)[0].code, { position_x: x, position_y: y });
    setNodes(prev => prev.map(node => node.id === id ? { ...node, position: { x, y } } : node));
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 3000);
  };

  const exportConfig = () => {
    const configData = {
      timestamp: new Date().toISOString(),
      cluster: "GCP-SOUTH-1",
      nodes: nodes,
      configurations: fileTemplates
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloud-infra-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showNotify("Configurações exportadas!");
  };

  const [notification, setNotification] = useState<any>(null);

  const showNotify = (text: any) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const canvasRef = useRef<any>(null);

  const exportMapImage = () => {
    if (!canvasRef.current) return;

    const node = document.getElementById("area");

    domToPng(canvasRef.current).then(x => {
      const link = document.createElement('a');
      link.href = x;
      link.download = `cluster-map-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(x);
      setShowExportMenu(false);
      showNotify("Mapa exportado como SVG!");
    });
  };

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
    setEdges(prev => prev.filter(e => e.id !== id));
    showNotify("Conexão removida");
  };
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMoveCanvas = (e: any) => {
    if (!tempEdge || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const MapInterator = () => (
    <div
      ref={canvasRef}
      className="relative w-full h-full"
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={() => setTempEdge(null)}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges Existentes */}
        {edges.map(edge => (
          <g key={edge.id} className="cursor-pointer group pointer-events-auto" onClick={(e) => { e.stopPropagation(); removeEdge(edge.id); }}>
            <path
              d={getPath(edge.source, edge.target)}
              stroke="#cbd5e1"
              strokeWidth="6"
              fill="none"
              className="opacity-0 group-hover:opacity-20 transition-opacity stroke-red-500"
            />
            <path
              d={getPath(edge.source, edge.target)}
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow)"
              className="group-hover:stroke-cyan-400 transition-colors"
            />
          </g>
        ))}

        {/* Edge Temporária sendo desenhada */}
        {tempEdge && (
          <path
            d={`M ${nodes.find(n => n.id === tempEdge.sourceId).position.x + 90} ${nodes.find(n => n.id === tempEdge.sourceId).position.y + 40} L ${mousePos.x} ${mousePos.y}`}
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="4,4"
            fill="none"
          />
        )}
        {/* Edge Temporária sendo desenhada */}
        {tempEdge && (
          <path
            d={`M ${nodes.find(n => n.id === tempEdge.sourceId).position.x + 90} ${nodes.find(n => n.id === tempEdge.sourceId).position.y + 40} L ${mousePos.x} ${mousePos.y}`}
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="4,4"
            fill="none"
          />
        )}
      </svg>

      {nodes.map(node => (
        <CustomNode
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onClick={setSelectedNodeId}
          onDrag={handleNodeDrag}
          onStartConnect={startConnect}
          onEndConnect={endConnect}
        />
      ))}
    </div>
  )

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'web',
    subType: 'db',
    image: '',
    port: '',
    replicas: '1'
  });

  const getPath = (sourceId: any, targetId: any) => {
    const sNode = nodes.find(n => n.id === sourceId);
    const tNode = nodes.find(n => n.id === targetId);
    if (!sNode || !tNode) return "";

    const sx = sNode.position.x + 90; // centro aprox
    const sy = sNode.position.y + 40;
    const tx = tNode.position.x + 90;
    const ty = tNode.position.y + 40;

    return `M ${sx} ${sy} C ${sx} ${(sy + ty) / 2}, ${tx} ${(sy + ty) / 2}, ${tx} ${ty}`;
  };


  const [fileContents, setFileContents] = useState({
    'docker-compose.yml': `version: '3.8'\nservices:\n  api:\n    build: ./backend\n    ports:\n      - "5000:5000"\n    depends_on:\n      - db\n  web:\n    image: nginx:stable\n    ports:\n      - "80:80"\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: example`,
    'deployment.yml': `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend-api\n  template:\n    metadata:\n      labels:\n        app: backend-api\n    spec:\n      containers:\n      - name: api\n        image: backend-image:v1`,
    'Dockerfile': `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 5000\nCMD ["npm", "start"]`,
    'service.yml': `apiVersion: v1\nkind: Service\nmetadata:\n  name: api-service\nspec:\n  selector:\n    app: backend-api\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: 5000`
  });

  const [state, formAction, pending] = useActionState(Create, { status: 200 });

  const propsFormCreateApplication = useForm<ApplicationCreate>({
    resolver: zodResolver(ApplicationValidator),
    defaultValues: {
      type: "NodePort",
      protocol: "TCP",
      replicas: "1",
      image_pull_policy: 'Always',
      position_x: 200 + Math.random() * 200,
      position_y: 200 + Math.random() * 100
    }
  });

  useEffect(function () {
    listEdges().then(r => {
      setEdges(r.map(edge => {
        const newEdge = {
          id: `e-${Date.now()}`,
          source: edge.source_id,
          target: edge.target_id
        };

        return newEdge;
      }));
    })
    fetch(`${window.location.href}/api/applications`, {
      method: "GET"
    }).then(async function (e) {
      var response: Application[] = await e.json();
      response.forEach(result => {
        const serviceId = `node-${result.name.toLowerCase().replace(/\s+/g, '-')}`;

        // Configuração do novo Node com base no tipo
        const newNode = {
          id: serviceId,
          code: result.id,
          // Se for WEB, usa 'container' (estilo escuro do Backend API)
          // type: state.data.type === 'web' ? 'container' : 'database',
          type: "container",
          data: {
            label: result.name,
            image: result.image,
            port: result.port,
            // subType: formData.type === 'web' ? 'api' : formData.subType,
            subType: "container",
            uptime: '0h',
            cpu: '0%'
          },
          position: { x: result.position_x, y: result.position_y }
        };

        const composeEntry = `\n  ${result.name.toLowerCase()}:\n    image: ${result.image}\n    ports:\n      - "${result.port}:${result.port}"`;

        setFileContents(prev => {
          const updated: any = { ...prev };
          updated['docker-compose.yml'] = prev['docker-compose.yml'] + composeEntry;

          // if (formData.type === 'web') {

          // }
          updated[`${result.name.toLowerCase()}-deployment.yml`] = `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${result.name.toLowerCase()}-deployment\nspec:\n  replicas: ${result.replicas}\n  selector:\n    matchLabels:\n      app: ${result.name.toLowerCase()}\n  template:\n    metadata:\n      labels:\n        app: ${result.name.toLowerCase()}\n    spec:\n      containers:\n      - name: ${result.name.toLowerCase()}\n        image: ${result.image}`;
          updated[`${result.name.toLowerCase()}-service.yml`] = `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${result.name.toLowerCase()}-service\nspec:\n  selector:\n    app: ${result.name.toLowerCase()}\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: ${result.port}`;

          return updated;
        });

        setNodes((prev: any) => [...prev, newNode]);
      });
    })
  }, [])

  useEffect(function () {
    if (state.status == 200) {
      setShowAddModal(false);

      if (state.data) {
        const serviceId = `node-${state.data.name.toLowerCase().replace(/\s+/g, '-')}`;

        // Configuração do novo Node com base no tipo
        const newNode = {
          id: serviceId,
          // Se for WEB, usa 'container' (estilo escuro do Backend API)
          // type: state.data.type === 'web' ? 'container' : 'database',
          type: "container",
          data: {
            label: state.data.name,
            image: state.data.image,
            port: state.data.port,
            // subType: formData.type === 'web' ? 'api' : formData.subType,
            subType: "container",
            uptime: '0h',
            cpu: '0%'
          },
          position: { x: state.data.position_x, y: state.data.position_y }
        };

        const composeEntry = `\n  ${state.data.name.toLowerCase()}:\n    image: ${state.data.image}\n    ports:\n      - "${state.data.port}:${state.data.port}"`;

        setFileContents(prev => {
          const updated: any = { ...prev };
          updated['docker-compose.yml'] = prev['docker-compose.yml'] + composeEntry;

          // if (formData.type === 'web') {

          // }
          updated[`${state.data.name.toLowerCase()}-deployment.yml`] = `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${state.data.name.toLowerCase()}-deployment\nspec:\n  replicas: ${state.data.replicas}\n  selector:\n    matchLabels:\n      app: ${state.data.name.toLowerCase()}\n  template:\n    metadata:\n      labels:\n        app: ${state.data.name.toLowerCase()}\n    spec:\n      containers:\n      - name: ${state.data.name.toLowerCase()}\n        image: ${state.data.image}`;
          updated[`${state.data.name.toLowerCase()}-service.yml`] = `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${state.data.name.toLowerCase()}-service\nspec:\n  selector:\n    app: ${state.data.name.toLowerCase()}\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: ${state.data.port}`;

          return updated;
        });

        setNodes((prev: any) => [...prev, newNode]);
        setShowAddModal(false);
        propsFormCreateApplication.reset({
          type: "NodePort",
          protocol: "TCP",
          replicas: "1",
          image_pull_policy: 'Always',
          position_x: 200 + Math.random() * 200,
          position_y: 200 + Math.random() * 100
        });
        showNotify(`Serviço ${state.data.name} registrado!`);
      }
    }
  }, [state])

  const handleAddService = (e: any) => {
    e.preventDefault();
    const serviceId = `node-${formData.name.toLowerCase().replace(/\s+/g, '-')}`;

    // Configuração do novo Node com base no tipo
    const newNode = {
      id: serviceId,
      // Se for WEB, usa 'container' (estilo escuro do Backend API)
      type: formData.type === 'web' ? 'container' : 'database',
      data: {
        label: formData.name,
        image: formData.image,
        port: formData.port,
        subType: formData.type === 'web' ? 'api' : formData.subType,
        uptime: '0h',
        cpu: '0%'
      },
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 100 }
    };

    const composeEntry = `\n  ${formData.name.toLowerCase()}:\n    image: ${formData.image}\n    ports:\n      - "${formData.port}:${formData.port}"`;

    setFileContents(prev => {
      const updated: any = { ...prev };
      updated['docker-compose.yml'] = prev['docker-compose.yml'] + composeEntry;

      if (formData.type === 'web') {
        updated[`${formData.name.toLowerCase()}-deployment.yml`] = `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${formData.name.toLowerCase()}-deployment\nspec:\n  replicas: ${formData.replicas}\n  selector:\n    matchLabels:\n      app: ${formData.name.toLowerCase()}\n  template:\n    metadata:\n      labels:\n        app: ${formData.name.toLowerCase()}\n    spec:\n      containers:\n      - name: ${formData.name.toLowerCase()}\n        image: ${formData.image}`;

        updated[`${formData.name.toLowerCase()}-service.yml`] = `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${formData.name.toLowerCase()}-service\nspec:\n  selector:\n    app: ${formData.name.toLowerCase()}\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: ${formData.port}`;
      }
      return updated;
    });

    setNodes((prev: any) => [...prev, newNode]);
    setShowAddModal(false);
    setFormData({ name: '', type: 'web', subType: 'db', image: '', port: '', replicas: '1' });
    showNotify(`Serviço ${formData.name} registrado!`);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900 select-none">
      {/* Notificação Toast */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-cyan-400" size={20} />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}
      {/* Modal de Cadastro */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <PlusCircle className="text-cyan-500" size={20} /> Novo Registro
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'web' })} className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${formData.type === 'web' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}>SERVIÇO WEB (API)</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'infra' })} className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${formData.type === 'infra' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}>INFRAESTRUTURA</button>
              </div>

              {formData.type === 'infra' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo de Infra</label>
                  <select
                    value={formData.subType}
                    onChange={e => setFormData({ ...formData, subType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium bg-white"
                  >
                    <option value="db">Banco de Dados (SQL/NoSQL)</option>
                    <option value="redis">Cache (Redis/In-memory)</option>
                    <option value="mq">Mensageria (RabbitMQ/Kafka)</option>
                  </select>
                </div>
              )}

              {
                formData.type === 'web' && (
                  <div className='max-h-[400px] overflow-y-auto flex flex-col gap-4 px-2'>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome do Serviço</label>
                      <input required {...propsFormCreateApplication.register("name")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: Auth-Service" />
                      {propsFormCreateApplication.formState.errors.name && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.name?.message}</p>)}
                    </div>
                    <p className='text-[12px] font-bold text-slate-600 uppercase ml-1'>Configurações de Servico: </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Porta Principal</label>
                        <input required {...propsFormCreateApplication.register("port")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: 8080" />
                        <p className="text-[10px]">Porta do SERVICE dentro do cluster.</p>
                        {propsFormCreateApplication.formState.errors.port && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.port?.message}</p>)}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Porta do Nó</label>
                        <input required {...propsFormCreateApplication.register("node_port")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: 8080" />
                        <p className="text-[10px]">Porta exposta em cada NODE do cluster. Permite acesso externo ao cluster.  (padrão: 30000-32767)</p>
                        {propsFormCreateApplication.formState.errors.node_port && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.node_port?.message}</p>)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Porta Corrente</label>
                        <input required {...propsFormCreateApplication.register("target_port")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: 8080" />
                        <p className="text-[10px]">Porta do container (Pod) para onde o tráfego será encaminhado.</p>
                        {propsFormCreateApplication.formState.errors.target_port && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.target_port?.message}</p>)}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Protocolo</label>
                        <input required {...propsFormCreateApplication.register("protocol")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: 8080" />
                        <p className="text-[10px]">Porta do container (Pod) para onde o tráfego será encaminhado.</p>
                        {propsFormCreateApplication.formState.errors.protocol && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.protocol?.message}</p>)}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo de exposição</label>
                        <input required {...propsFormCreateApplication.register("type")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: 8080" />
                        <p className="text-[10px]">Define como o Service será exposto na rede.</p>
                        {propsFormCreateApplication.formState.errors.type && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.type?.message}</p>)}
                      </div>
                    </div>
                    <p className='text-[12px] font-bold text-slate-600 uppercase ml-1'>Configurações de Publicação: </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Imagem Docker: </label>
                      <input required {...propsFormCreateApplication.register("image")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium font-mono" placeholder="Ex: node:18-alpine" />
                      {propsFormCreateApplication.formState.errors.image && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.image?.message}</p>)}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome do container: </label>
                      <input required {...propsFormCreateApplication.register("container_name")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium font-mono" placeholder="Ex: teste" />
                      {propsFormCreateApplication.formState.errors.container_name && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.container_name?.message}</p>)}
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Réplicas (K8s)</label>
                        <input type="number" min="1" {...propsFormCreateApplication.register("replicas")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" />
                        {propsFormCreateApplication.formState.errors.replicas && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.replicas?.message}</p>)}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Politica de construção do container</label>
                        <input required {...propsFormCreateApplication.register("image_pull_policy")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: 8080" />
                        <p className="text-[10px]">define quando o kubelet deve baixar a imagem do container do registry.</p>
                        {propsFormCreateApplication.formState.errors.image_pull_policy && (<p className='text-[12px] text-red-500 font-bold'>{propsFormCreateApplication.formState.errors.image_pull_policy?.message}</p>)}
                      </div>
                    </div>
                  </div>
                )}

              <button type="button" onClick={async () => {
                if (await propsFormCreateApplication.trigger()) {
                  startTransition(() => {
                    formAction(propsFormCreateApplication.watch());
                  });
                }
              }} className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-100 flex items-center justify-center gap-2">
                <Save size={18} /> Salvar no Cluster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar - Menu Lateral */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-30">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-cyan-500 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
            <Layers className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-white tracking-tight text-lg">CloudDeploy</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-2 tracking-widest">Infraestrutura</p>
          {[
            { id: 'nodes-map', label: 'Mapa de Nodes', icon: Activity },
            { id: 'files', label: 'Arquivos de Config', icon: FileCode },
            { id: 'security', label: 'Políticas de Rede', icon: ShieldCheck },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${activeTab === item.id ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'}`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-cyan-400' : ''} />
              {item.label}
            </button>
          ))}

          <p className="text-[10px] font-bold text-slate-500 uppercase px-2 mt-6 mb-2 tracking-widest">Ambientes</p>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-cyan-500/10 text-cyan-400 text-sm">
              <span className="flex items-center gap-2 font-medium"> <Globe size={16} /> Produção</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-sm opacity-60">
              <Settings size={16} /> Staging
            </button>
          </div>

        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-xs">
            <div className="flex justify-between items-center mb-2 text-slate-400">
              <span className="flex items-center gap-1.5"><Zap size={12} /> CPU Total</span>
              <span className="text-cyan-400 font-bold">42%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-[42%] transition-all duration-1000"></div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700/50 transition-colors"
            >
              <Plus size={18} /> Adicionar Serviço
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-slate-400">
              <ChevronRight size={20} />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              {activeTab === 'nodes-map' ? 'Visualização de Cluster' : 'Editor de Configuração'}
            </h2>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-[11px] font-bold text-green-600 border border-green-100 uppercase tracking-tighter">
              <Activity size={12} /> CLUSTER: GCP-SOUTH-1
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${showExportMenu ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                <Download size={16} /> Exportar
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={exportConfig}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><FileJson size={16} /></div>
                      <div className="text-left">
                        <div className="font-bold">Configurações</div>
                        <div className="text-[10px] text-slate-400">Exportar estado atual (.json)</div>
                      </div>
                    </button>
                    <div className="h-px bg-slate-100 mx-2 my-1"></div>
                    <button
                      onClick={exportMapImage}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><ImageIcon size={16} /></div>
                      <div className="text-left">
                        <div className="font-bold">Imagem do Mapa</div>
                        <div className="text-[10px] text-slate-400">Exportar gráfico (.svg)</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-all active:scale-95">
              <Save size={16} /> Salvar
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 ${isDeploying ? 'bg-slate-400 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-200'
                }`}
            >
              {isDeploying ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Canvas Arrastável */}
          <div className={`flex-1 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden transition-all duration-500 ${activeTab !== 'nodes-map' ? 'opacity-30 scale-95 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <button className="p-2 bg-white shadow-xl border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-transform active:scale-90">
                <Plus size={20} />
              </button>
              <button className="p-2 bg-white shadow-xl border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-transform active:scale-90">
                <MousePointer2 size={20} />
              </button>
              <button
                onClick={() => setNodes(nodes.map(n => ({ ...n, position: { x: n.position.x + 5, y: n.position.y } })))}
                className="p-2 bg-white shadow-xl border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-transform active:scale-90"
              >
                <Maximize2 size={20} />
              </button>
            </div>

            {/* Nodes e Conexões */}
            <MapInterator />

            {/* Legenda Flutuante */}
            <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest flex gap-4 z-20">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Service</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-800 border border-cyan-400"></div> Container</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Database</div>
            </div>
          </div>

          {/* Sidebar de Detalhes / Editor */}
          <div className={`w-[450px] border-l border-slate-200 bg-white flex flex-col shadow-2xl z-20 transform transition-transform duration-300`}>

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

            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedNode && activeTab === 'nodes-map' ? (
                /* Painel de Detalhes do Node Selecionado */
                <div className="flex-1 p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <span className="p-2 bg-slate-100 rounded-lg text-slate-600"><Settings size={20} /></span>
                      Configuração do Node
                    </h3>
                    <button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
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
                      <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                        <Terminal size={18} /> Abrir Terminal de Node
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
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
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
                    {selectedNode && <p className="flex gap-2 text-cyan-500"><span>[14:25:42]</span> Node selecionado: {selectedNode.data.label}</p>}
                  </>
                )}
                <p className="text-slate-500 animate-pulse">_</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Estilos Globais */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .select-none { user-select: none; }
      `}</style>
    </div>
  );
}