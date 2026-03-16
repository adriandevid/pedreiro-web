'use server';

import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { exec } from "child_process";

export default async function StopInfrastructureComponent(prev: any, id: number) : Promise<{
    status: number
} | undefined> {

    const rows = localdatabase.prepare(`select * from infrastructure_component where id = ${id}`).all() as { service_key: string }[];

    const buildComponent = new Promise<string>((resolve, reject) => {
        exec(`docker compose -f ./configuration/docker-compose.yml stop ${rows[0].service_key}`, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
                return;
            }
            resolve("success");
        })
    });
    
    await buildComponent;

    return {
        status: 200
    }
}