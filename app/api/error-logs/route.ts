import { NextRequest, NextResponse } from "next/server"
import ErrorLog from "@/models/ErrorLog"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      errorType,
      errorMessage,
      endpoint,
      method,
      userId,
      requestData,
      stackTrace,
    } = body

    // Validate required fields
    if (!errorType || !errorMessage || !endpoint || !method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    // Create error log entry
    const errorLog = await ErrorLog.create({
      errorType,
      errorMessage,
      endpoint,
      method,
      userId: userId || null,
      requestData: requestData || null,
      stackTrace: stackTrace || null,
    })

    return NextResponse.json({ success: true, errorLog }, { status: 201 })
  } catch (error) {
    console.error("Failed to log error:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const errorType = searchParams.get("errorType")
    const resolved = searchParams.get("resolved")

    const query: any = {}

    if (errorType && errorType !== "all") {
      query.errorType = errorType
    }

    if (resolved !== null && resolved !== undefined) {
      query.resolved = resolved === "true"
    }

    const skip = (page - 1) * limit

    const [errorLogs, total] = await Promise.all([
      ErrorLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ErrorLog.countDocuments(query),
    ])

    return NextResponse.json({
      data: errorLogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch error logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch error logs" },
      { status: 500 },
    )
  }
}
