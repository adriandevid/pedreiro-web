import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { ImageHub } from "@pedreiro-web/infrastructure/repository/types";
import { localdatabase } from "@pedreiro-web/infrastructure/database/config";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const username = searchParams.get('username');
    const password = searchParams.get('password');
    const registryId = searchParams.get('registry_id');


    console.log(localdatabase.prepare(`select * from image_registry`).all());

    const imageHubs = localdatabase.prepare(`select * from image_registry where id = ${registryId}`).all() as ImageHub[];
    
    console.log(imageHubs, `select * from image_registry where id = ${registryId}`);

    const executeCommand = new Promise<string>((resolve, reject) => {
        exec(`curl -u ${username}:${password} ${imageHubs[0].url}/v2/_catalog`, { windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
                return;
            }
            resolve(`${stdout}`);
        })
    })

    return NextResponse.json(JSON.parse(await executeCommand), { status: 200 })
}