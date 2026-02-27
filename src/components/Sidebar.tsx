import { Github, Gitlab, LayoutDashboard, LockKeyhole, Network, Rocket, Settings, Waypoints } from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="p-4 h-full w-[22rem] flex flex-col gap-4 justify-between">
            <div className="flex flex-col gap-5">
                <div className="px-2 flex items-center gap-4">
                    <img src="https://cdn-icons-png.freepik.com/256/15080/15080906.png?semt=ais_white_label" alt="" width={40} />
                    <span className="font-semibold">Pedreiro</span>
                </div>
                <div>
                    <ul className="flex flex-col gap-2">
                        <li className="py-2 px-4 py-4 rounded-lg font-normal flex gap-2 items-center"><LayoutDashboard size={18} />Dashboard</li>
                        <li className="bg-[#2563eb] text-white px-4 py-3 rounded-lg flex gap-2 items-center"><Waypoints size={18} />Service Graph</li>
                        <li className="py-2 px-4 py-4 rounded-lg font-normal flex gap-2 items-center"><Rocket size={18} />Deployments</li>
                        <li className="py-2 px-4 py-4 rounded-lg font-normal flex gap-2 items-center"><Settings size={18} />Settings</li>
                    </ul>
                </div>
            </div>

            <div className="rounded-md border border-1 border-gray-100 p-4">
                <p className="text-md flex gap-2 items-center"><LockKeyhole size={18} />Authentication Required</p>
                <p className="text-sm pt-2 text-gray-400"> You are viewing the graph in read-only mode. Sign in to edit nodes and deploy configurations. </p>
                <button className="border border-1 mt-2 border-gray-100 mt-5 p-3 flex items-center gap-2 w-full justify-center"><Github></Github> Signin GitHub</button>
                <button className="border border-1 mt-2 border-gray-100 p-3 flex items-center gap-2 w-full justify-center"><Gitlab></Gitlab> Signin GitLab</button>
            </div>
        </aside>
    )
}