'use server';

import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { Application, ApplicationFile, ApplicationUpdate } from "@pedreiro-web/infrastructure/repository/types/application";

export default async function UpdateApplication(prev: any, body: ApplicationUpdate) : Promise<any> {
    const row = localdatabase.prepare(`select * from application where id = ${body.id}`).all() as Application[];
    if (row.length == 0) {
        return { message: "Código não existe!", status: 400 }
    }

    localdatabase.exec(`
        update application
        set name = '${body.name}', port = ${body.port}, node_port = ${body.node_port}, target_port = ${body.target_port}, container_name = '${body.container_name}', image = '${body.image}', replicas = ${body.replicas}
        where id = ${body.id}
    `)

    if (body.files != undefined && body.files.length > 0) {
        var files = localdatabase.prepare(`select * from application_files where application_id = ${body.id}`).all() as ApplicationFile[];

        body.files.filter(element => element.id != 0 && element.id != undefined).forEach(element => {
            localdatabase.exec(`
                    update application_files
                    set name = '${element.name}', file = '${element.file}'
                    where id = ${element.id}
                `)
        });


        
        files.forEach(file => {
            if (body.files?.filter(x => x.id == file.id).length == 0) {
                localdatabase.exec(`
                    DELETE FROM application_files
                    WHERE id = ${file.id};
                `)
            }
        })

        body.files.filter(element => element.id == 0 || element.id == undefined).forEach(element => {
            localdatabase.exec(`
                    insert into application_files(name, file, application_id)
                    values ('${element.name}', '${element.file}', ${body.id})    
                `)
        });
        
        row[0].files = localdatabase.prepare(`select * from application_files where application_id = ${body.id}`).all() as ApplicationFile[];
    }

    return { data: row[0], status: 200 }
}