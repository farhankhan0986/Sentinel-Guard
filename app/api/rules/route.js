import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FirewallRule from "@/models/FirewallRule";

export async function GET() {
    try {
        await connectDB();
        const rules = await FirewallRule.find({}).lean();
        return NextResponse.json({ rules });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
    }
}