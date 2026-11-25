import nodemailer from "nodemailer";
import { enquirySchema } from "@/lib/content";
import { connect, Enquiry } from "@/lib/db";
import { getSite, loanOptions } from "@/lib/site";
import { clientIp, digest, limited, sameOrigin } from "@/lib/security";
const reply = (message: string, status: number) =>
  Response.json({ message }, { status });
function sourcePath(request: Request) {
  try {
    const ref = new URL(request.headers.get("referer") || "");
    return ref.origin === request.headers.get("origin") &&
      /^\/[a-z0-9-]*$/.test(ref.pathname)
      ? ref.pathname
      : "/";
  } catch {
    return "/";
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply("Request origin is invalid.", 403);
  if (Number(request.headers.get("content-length")) > 8500)
    return reply("Enquiry is too long.", 413);
  const json = await request.text();
  if (json.length > 8500) return reply("Enquiry is too long.", 413);
  let body: unknown;
  try {
    body = JSON.parse(json);
  } catch {
    return reply("Invalid enquiry.", 400);
  }
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) return reply(parsed.error.issues[0].message, 400);
  const { website, consent, ...enquiry } = parsed.data;
  if (website) return reply("Enquiry received.", 200);
  if (!consent || !process.env.MONGODB_URI)
    return reply("The enquiry form is temporarily unavailable.", 503);
  try {
    await connect();
    const site = await getSite();
    if (site?.bundled)
      return reply("The enquiry form is temporarily unavailable.", 503);
    if (await limited("enquiry", clientIp(request.headers), 8, 600000))
      return reply("Please wait a few minutes before trying again.", 429);
    if (
      !site ||
      site.page.status !== "published" ||
      !loanOptions(site).some((option) => option.value === enquiry.loan)
    )
      return reply("Select an available loan option.", 400);
    const config = site.sections.find((s) => s.type === "contact")?.content;
    const recipient = config?.recipient || process.env.ADMIN_EMAIL;
    const dedupe = digest(
      JSON.stringify([
        enquiry.phone,
        enquiry.loan,
        enquiry.message.toLowerCase(),
        Math.floor(Date.now() / 900000),
      ]),
    );
    await Enquiry.init();
    const saved = await Enquiry.create({
      ...enquiry,
      sourcePage: sourcePath(request),
      dedupe,
      consentAt: new Date(),
    });
    let notification = "Unconfigured";
    const port = Number(process.env.SMTP_PORT || 587);
    if (process.env.SMTP_HOST && recipient && process.env.SMTP_FROM) {
      try {
        const smtp = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port,
          disableFileAccess: true,
          disableUrlAccess: true,
          secure: port === 465,
          requireTLS: port !== 465,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        });
        await smtp.sendMail({
          from: process.env.SMTP_FROM,
          to: recipient,
          subject: "New website enquiry",
          text:
            "A new enquiry is available in the admin dashboard. Reference " +
            saved.id,
        });
        notification = "Sent";
      } catch {
        notification = "Failed";
      }
    }
    await Enquiry.updateOne({ _id: saved._id }, { $set: { notification } });
    return reply(config?.success || "Enquiry received.", 201);
  } catch (error) {
    if ((error as { code?: number }).code === 11000)
      return reply("Your enquiry has already been received.", 200);
    return reply(
      "The enquiry service is temporarily unavailable. Please try again.",
      503,
    );
  }
}
