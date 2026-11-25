import { adminEmail } from "@/auth";
import { AuditLog, Enquiry, connect } from "@/lib/db";
import { csvCell, enquiryFilter, type Row } from "@/lib/enquiry-admin";
export async function GET(request: Request) {
  const actor = await adminEmail();
  if (!actor) return new Response(null, { status: 401 });
  await connect();
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const cursor = Enquiry.find(enquiryFilter(params))
    .sort({ createdAt: -1 })
    .lean<Row[]>()
    .cursor();
  await AuditLog.create({
    actor,
    action: "export-enquiries",
    target: "filtered",
  });
  const encoder = new TextEncoder();
  const keys = [
    "_id",
    "createdAt",
    "name",
    "phone",
    "email",
    "loan",
    "message",
    "source",
    "sourcePage",
    "consentAt",
    "status",
    "notes",
    "notification",
  ] as const;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(keys.join(",") + "\r\n"));
    },
    async pull(controller) {
      const row = await cursor.next();
      if (!row) {
        controller.close();
        return;
      }
      controller.enqueue(
        encoder.encode(
          keys
            .map((key) =>
              csvCell(
                row[key] instanceof Date
                  ? (row[key] as Date).toISOString()
                  : row[key],
              ),
            )
            .join(",") + "\r\n",
        ),
      );
    },
    async cancel() {
      await cursor.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="enquiries.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
