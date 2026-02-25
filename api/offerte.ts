import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * All runtime imports are dynamic (await import(...)) so the compiled output
 * has NO top-level `import` statements.  This prevents the CJS/ESM mismatch
 * that Vercel's Node runtime can trigger ("Cannot use import statement outside
 * a module").  `import type` above is erased at compile time — zero output.
 */

function safeNumber(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    // ── Dynamic imports (CJS + ESM safe) ─────────────────────────
    const [
      { default: nodemailer },
      { default: React },
      { renderToBuffer },
      { OfferPdf }
    ] = await Promise.all([
      import("nodemailer"),
      import("react"),
      import("@react-pdf/renderer"),
      import("../src/pdf/OfferPdf.js")
    ]);

    const { offer } = req.body || {};
    if (!offer?.contact?.email)
      return res.status(400).json({ message: "Missing contact.email" });

    const reference: string = offer.reference || `OFF-${Date.now()}`;
    const createdAt = new Date().toLocaleString("nl-NL");

    // Only include preview image if it's an absolute public URL
    const rawImageUrl: string | undefined = offer.previewImageUrl;
    const safeImageUrl =
      rawImageUrl &&
      rawImageUrl.startsWith("http") &&
      !rawImageUrl.includes("localhost")
        ? rawImageUrl
        : undefined;

    // ── Build PDF document (React.createElement, no JSX) ─────────
    const doc = React.createElement(OfferPdf, {
      reference,
      createdAt,
      productTitle: offer.productTitle || "Offerteaanvraag",
      productHandle: offer.productHandle,
      previewImageUrl: safeImageUrl,
      contact: {
        name: offer.contact.name,
        email: offer.contact.email,
        phone: offer.contact.phone,
        postcode: offer.contact.postcode,
        city: offer.contact.city
      },
      options: (offer.options || []).map((o: any) => ({
        label: String(o.label || ""),
        value: String(o.value || ""),
        price: safeNumber(o.price)
      })),
      totals: {
        base: safeNumber(offer.totals?.base),
        options: safeNumber(offer.totals?.options),
        shipping: safeNumber(offer.totals?.shipping),
        total: safeNumber(offer.totals?.total)
      },
      notes: offer.notes
    });

    // ── Generate PDF ─────────────────────────────────────────────
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(doc as any);
    } catch (pdfErr: any) {
      console.error("PDF generation error:", pdfErr);
      return res
        .status(500)
        .json({ message: "PDF generatie mislukt", detail: pdfErr?.message });
    }

    // ── SMTP setup ───────────────────────────────────────────────
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Missing SMTP env vars", {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS
      });
      return res
        .status(500)
        .json({ message: "E-mail configuratie ontbreekt op de server" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // ── E-mail content ───────────────────────────────────────────
    const subjectAdmin = `Nieuwe offerteaanvraag ${reference}`;
    const subjectCustomer = `Bevestiging offerteaanvraag ${reference}`;

    const htmlAdmin = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.4">
        <h2 style="color:#003878;margin:0 0 8px">Nieuwe offerteaanvraag</h2>
        <p style="margin:0 0 12px"><b>Referentie:</b> ${reference}<br/><b>Datum:</b> ${createdAt}</p>
        <p style="margin:0 0 12px"><b>Klant:</b> ${offer.contact.name || "-"} • ${offer.contact.email} • ${offer.contact.phone || "-"}</p>
        <p style="margin:0 0 12px"><b>Product:</b> ${offer.productTitle || "-"}</p>
        <p style="margin:0 0 12px;color:#475569">PDF is bijgevoegd.</p>
      </div>
    `;

    const htmlCustomer = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.4">
        <h2 style="color:#003878;margin:0 0 8px">Bedankt voor je offerteaanvraag</h2>
        <p style="margin:0 0 12px">We hebben je aanvraag ontvangen. Je ontvangt zo snel mogelijk een reactie.</p>
        <p style="margin:0 0 12px"><b>Referentie:</b> ${reference}</p>
        <p style="margin:0 0 12px;color:#475569">Je PDF-overzicht is bijgevoegd.</p>
        <a href="https://www.hettveranda.nl" style="display:inline-block;background:#FF7300;color:white;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:700">
          Terug naar de webshop
        </a>
      </div>
    `;

    // ── Send e-mails ─────────────────────────────────────────────
    await transporter.sendMail({
      from: `"HETT Veranda" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: "info@hettveranda.nl",
      replyTo: offer.contact.email,
      subject: subjectAdmin,
      html: htmlAdmin,
      attachments: [
        { filename: `Offerte-${reference}.pdf`, content: pdfBuffer }
      ]
    });

    await transporter.sendMail({
      from: `"HETT Veranda" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: offer.contact.email,
      subject: subjectCustomer,
      html: htmlCustomer,
      attachments: [
        { filename: `Offerte-${reference}.pdf`, content: pdfBuffer }
      ]
    });

    return res.status(200).json({ success: true, reference });
  } catch (e: any) {
    console.error("Offer handler error:", e);
    return res
      .status(500)
      .json({ message: "Er is een fout opgetreden", detail: e?.message });
  }
}
