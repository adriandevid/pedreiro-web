import { localdatabase } from "@pedreiro-web/infrastructure/database/config";
import { ApplicationCreate } from "@pedreiro-web/infrastructure/repository/types";
import { NextRequest, NextResponse } from "next/server"

async function GET() {
    const row = localdatabase.prepare('SELECT * FROM users WHERE id = ?').get(2);
    // console.log(row.firstName, row.lastName, row.email);

    return NextResponse.json({}, { status: 200 })
}


async function POST(request: NextRequest) {
    const body: ApplicationCreate = await request.json();

    localdatabase.exec(`
        insert into application(name, port, node_port, target_port)
    `)

    // console.log(row.firstName, row.lastName, row.email);

    return NextResponse.json({}, { status: 200 })
}


export { GET }