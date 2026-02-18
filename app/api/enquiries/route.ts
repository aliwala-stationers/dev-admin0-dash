import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getEnquiryModel } from "@/models/Enquiry";

export async function GET() {
  await connectDB();
  const Enquiry = getEnquiryModel();
  const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
  return NextResponse.json(enquiries);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const Enquiry = getEnquiryModel();
    const body = await req.json();
    const record = await Enquiry.create(body);
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
