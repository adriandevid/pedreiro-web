import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { Application, ApplicationCreate, ApplicationFile } from "@pedreiro-web/infrastructure/repository/types";
import { NextRequest, NextResponse } from "next/server"

async function GET() {
    const row = localdatabase.prepare('SELECT * FROM users WHERE id = ?').get(2);
    // console.log(row.firstName, row.lastName, row.email);

    return NextResponse.json({}, { status: 200 })
}


async function POST(request: NextRequest) {
    const body: ApplicationCreate = await request.json();

    localdatabase.exec(`
        insert into application(name, port, node_port, target_port, container_name, image, container_port, replicas, configuration_id)
        values ('${body.name}', ${body.port}, ${body.node_port}, ${body.target_port}, '${body.container_name}', '${body.image}', '${body.container_port}', ${body.replicas}, 1)
    `)

    const row = localdatabase.prepare("select * from application order by id desc limit 1").all()
    const applicationCreatedResult: Application = row[0] as Application;

    if (body.files.length > 0) {
        body.files.forEach(element => {
            localdatabase.exec(`
                insert into application_files(name, file, application_id)
                values ('${element.name}', '${element.file}', ${applicationCreatedResult.id})    
            `)
        });

        const row = localdatabase.prepare(`select * from application_files where application_id = ${applicationCreatedResult.id}`).all()
        const applicationFilesCreatedResult: ApplicationFile[] = row as ApplicationFile[];

        return NextResponse.json({
            ...applicationCreatedResult,
            files: applicationFilesCreatedResult
        }, { status: 200 })
    }

    return NextResponse.json(applicationCreatedResult, { status: 200 })
}


export { GET, POST }