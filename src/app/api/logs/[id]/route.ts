import { InfrastructureComponent } from "@pedreiro-web/infrastructure/repository/types/infrastructure-component";
import { NextRequest, NextResponse } from "next/server";
import { localdatabase } from "@pedreiro-web/infrastructure/database/config";

async function GET(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const { id } = await params;

    const infrastructureComponents = localdatabase.prepare(`select * from infrastructure_component where id = ${id}`).all() as InfrastructureComponent[];
    const infrastructureComponent = infrastructureComponents[0];

    const logs: { resource: string, log: string, time: number, short_log: string }[] = localdatabase.prepare(`select * from log where resource = '${infrastructureComponent.service_key}'`).all() as any[];

    return NextResponse.json(logs, { status: 200 });
}

export { GET }