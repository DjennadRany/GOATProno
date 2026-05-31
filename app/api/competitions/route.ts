import { COMPETITIONS } from "@/domain/competition"

export async function GET() {
  return Response.json({ competitions: COMPETITIONS })
}
