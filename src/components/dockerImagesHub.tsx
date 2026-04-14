'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Settings, Trash, X, User, PlusCircle, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const formLoginImageRegistryScheme = z.object({
    user_name: z.string(),
    password: z.string()
})

export type FormLoginImageRegistryRequest = z.infer<typeof formLoginImageRegistryScheme>;


export default function DockerImagesHub() {
    const [showModalLoginRegistry, setShowModalLoginRegistry] = useState<boolean>(false);
    const propsFormLoginImageRegistry = useForm<FormLoginImageRegistryRequest>({
        resolver: zodResolver(formLoginImageRegistryScheme),
        defaultValues: {}
    });

    return (
        <div className="flex-1 p-6 animate-in fade-in slide-in-from-right-4 duration-300 w-[100rem] h-full bg-white">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <span className="p-2 bg-slate-100 rounded-lg text-slate-600"><Settings size={20} /></span>
                    Docker image registres
                </h3>
                <div className='flex flex-row gap-2'>
                    <button onClick={() => {
                        //setShowConfirmModal(true);
                    }} className="p-1 hover:bg-red-100 rounded-full cursor-pointer text-red-400"><Trash size={20} /></button>
                    <button onClick={() => {
                        //setSelectedNodeId(null)
                        //setShowContentDetails(false);
                    }} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"><X size={20} /></button>
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-row gap-4 items-center'>
                    <div className="space-y-1">
                        <input type="text" className=" w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder='ex: http://localhost:port' />
                    </div>
                    {/* <div className="space-y-1">
                          <input type="text" className=" w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder='valor' />
                        </div> */}
                    <div className="space-y-1">
                        <button type='button' className='text-sm bg-sky-500 flex-1 rounded-lg text-white w-10 h-10 flex flex-row justify-center items-center'><Plus size={20}></Plus></button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-row items-center bg-gray-50 p-4 rounded-lg gap-4 w-[max-content]">
                    <span className="text-sm">https://localhost:3000</span>
                    <button title="login into image registry" onClick={() => { setShowModalLoginRegistry(true) }} className="p-2 bg-green-400 rounded-lg shadow-md hover:bg-green-500 cursor-pointer"><User color="white" size={15}></User></button>
                    <button title="remove image registry" onClick={() => { setShowModalLoginRegistry(true) }} className="p-2 bg-red-400 rounded-lg shadow-md hover:bg-red-500 cursor-pointer"><X color="white" size={15}></X></button>
                </div>
            </div>

            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" hidden={!showModalLoginRegistry}>
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <PlusCircle className="text-cyan-500" size={20} /> Novo Registro
                        </h3>
                        <button onClick={() => setShowModalLoginRegistry(!showModalLoginRegistry)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <form className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">User Name: </label>
                            <input required {...propsFormLoginImageRegistry.register("user_name")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: example" />
                            {propsFormLoginImageRegistry.formState.errors.user_name && (<p className='text-[12px] text-red-500 font-bold'>{propsFormLoginImageRegistry.formState.errors.user_name?.message}</p>)}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password: </label>
                            <input required {...propsFormLoginImageRegistry.register("password")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium" placeholder="Ex: example" />
                            {propsFormLoginImageRegistry.formState.errors.password && (<p className='text-[12px] text-red-500 font-bold'>{propsFormLoginImageRegistry.formState.errors.password?.message}</p>)}
                        </div>
                        <button type="button" onClick={async () => {
                       
                    }} className="w-full py-3 mt-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-100 flex items-center justify-center gap-2">
                        <Save size={18} /> Fazer login
                    </button>
                    </form>
                </div>
            </div>
        </div>
    )
}