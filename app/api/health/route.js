import { NextResponse } from "next/server";

export function GET(){
    return NextResponse.json({status: 'Sentinel Guard Active'}, {status: 200});
}