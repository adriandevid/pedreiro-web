import { exec } from "child_process";

export type MemoryInformations = {
    freeSpace?: number | undefined;
    size: number;
}

export async function getLocalMemoryInformations(): Promise<MemoryInformations> {
    return new Promise((resolve, reject) => {
        exec("wmic logicaldisk get caption, freespace, size", (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
                return;
            }

            const disks = stdout.split(/(?=^[A-Z]:)/gm);
            const selectedDisck = disks.filter(x => x.includes("C:"))[0].replaceAll("\\r", "").replaceAll("\\n", "").split(/(\d\S*)/gm);

            resolve({
                freeSpace: parseInt(selectedDisck[1].replaceAll(" ", "")),
                size: parseInt(selectedDisck[3].replaceAll(" ", ""))
            })
        })
    });
}

export async function getLocalMemoryInformationsLinux(defaultValue?: string | undefined): Promise<MemoryInformations> {
    return new Promise((resolve, reject) => {
        if (defaultValue) {
            const selectedDisck = defaultValue
                    .replace(/^NAME.*\n/gm, '')
                    .split(/(?=^[a-z]+\d+)/gm)
                    .map(x => x.replaceAll("\n", ""))
                    .filter(x => x.includes("sda "))[0]
                    .split(/(\S+)/gm).filter(x => !x.includes(" ") && x != "");

            resolve({
                size: parseInt(selectedDisck[1].replaceAll(" ", ""))
            })
        } else {
            exec("lsblk -d -o NAME,SIZE", (error, stdout, stderr) => {
                if (error) {
                    reject(`exec error: ${error}`);
                    return;
                }

                const selectedDisck = stdout
                    .replace(/^NAME.*\n/, '')
                    .split(/(?=^[a-z]+\d+)/gm)
                    .filter(x => x.includes("sda "))[0].split(/(\\S+)/);

                resolve({
                    size: parseInt(selectedDisck[1].replaceAll(" ", ""))
                })
            })
        }
    });
}