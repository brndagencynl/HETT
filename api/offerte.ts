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
      pdfMod
    ] = await Promise.all([
      import("nodemailer"),
      import("react"),
      import("@react-pdf/renderer")
    ]);

    const { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } =
      pdfMod as any;
    const h = React.createElement;

    // ── PDF styles ───────────────────────────────────────────────
    const s = StyleSheet.create({
      page:      { padding: 32, fontSize: 11, color: "#0f172a" },
      header:    { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
      brand:     { fontSize: 18, fontWeight: 700, color: "#003878" },
      sub:       { fontSize: 10, color: "#475569", marginTop: 4 },
      badge:     { backgroundColor: "#FF7300", padding: 8, borderRadius: 8, color: "#fff", fontSize: 10 },
      section:   { marginTop: 16, paddingTop: 12, borderTop: "1px solid #e2e8f0" },
      h2:        { fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#003878" },
      row:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1px solid #f1f5f9" },
      label:     { color: "#334155" },
      value:     { color: "#0f172a", fontWeight: 600 },
      totalsBox: { marginTop: 12, padding: 12, backgroundColor: "#EDF0F2", borderRadius: 10 },
      totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
      grand:     { fontSize: 14, fontWeight: 800, color: "#003878" },
      imgWrap:   { marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" },
      footer:    { marginTop: 18, fontSize: 9, color: "#64748b" }
    });

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

    const contact = {
      name: offer.contact.name,
      email: offer.contact.email,
      phone: offer.contact.phone,
      postcode: offer.contact.postcode,
      city: offer.contact.city
    };

    const options: { label: string; value: string; price?: number }[] =
      (offer.options || []).map((o: any) => ({
        label: String(o.label || ""),
        value: String(o.value || ""),
        price: safeNumber(o.price)
      }));

    const totals = {
      base: safeNumber(offer.totals?.base),
      options: safeNumber(offer.totals?.options),
      shipping: safeNumber(offer.totals?.shipping),
      total: safeNumber(offer.totals?.total)
    };

    const productTitle = offer.productTitle || "Offerteaanvraag";
    const notes: string | undefined = offer.notes;

    const money = (n?: number) =>
      typeof n === "number" ? `€ ${n.toFixed(2).replace(".", ",")}` : "—";

    // ── Build PDF element tree (React.createElement, no JSX) ─────
    const doc = h(Document, null,
      h(Page, { size: "A4", style: s.page },

        // Header
        h(View, { style: s.header },
          h(View, null,
            h(Text, { style: s.brand }, "HETT Veranda"),
            h(Text, { style: s.sub }, "Offerteaanvraag \u2022 Hoppenkuil 17, 5626DD Eindhoven"),
            h(Text, { style: s.sub }, `Referentie: ${reference} \u2022 ${createdAt}`)
          ),
          h(View, null,
            h(Text, { style: s.badge }, "Offerteaanvraag")
          )
        ),

        // Klantgegevens
        h(View, { style: s.section },
          h(Text, { style: s.h2 }, "Klantgegevens"),
          h(View, { style: s.row }, h(Text, { style: s.label }, "Naam"), h(Text, { style: s.value }, contact.name || "\u2014")),
          h(View, { style: s.row }, h(Text, { style: s.label }, "E-mail"), h(Text, { style: s.value }, contact.email)),
          h(View, { style: s.row }, h(Text, { style: s.label }, "Telefoon"), h(Text, { style: s.value }, contact.phone || "\u2014")),
          h(View, { style: s.row }, h(Text, { style: s.label }, "Postcode / Plaats"), h(Text, { style: s.value }, `${contact.postcode || "\u2014"} ${contact.city || ""}`))
        ),

        // Product
        h(View, { style: s.section },
          h(Text, { style: s.h2 }, "Product"),
          h(View, { style: s.row }, h(Text, { style: s.label }, "Product"), h(Text, { style: s.value }, productTitle)),
          safeImageUrl
            ? h(View, { style: s.imgWrap },
                h(Image, { src: safeImageUrl, style: { width: "100%", height: 220, objectFit: "cover" } })
              )
            : null
        ),

        // Configuratie
        h(View, { style: s.section },
          h(Text, { style: s.h2 }, "Configuratie"),
          ...(options.length
            ? options.map((o, idx) =>
                h(View, { key: String(idx), style: s.row },
                  h(Text, { style: s.label }, o.label),
                  h(Text, { style: s.value },
                    o.value + (typeof o.price === "number" ? `  (${money(o.price)})` : "")
                  )
                )
              )
            : [h(Text, null, "\u2014")]
          ),

          // Totals box
          h(View, { style: s.totalsBox },
            h(View, { style: s.totalLine }, h(Text, null, "Basisprijs"), h(Text, { style: { fontWeight: 700 } }, money(totals.base))),
            h(View, { style: s.totalLine }, h(Text, null, "Opties"), h(Text, { style: { fontWeight: 700 } }, money(totals.options))),
            h(View, { style: s.totalLine }, h(Text, null, "Verzending"), h(Text, { style: { fontWeight: 700 } }, money(totals.shipping))),
            h(View, { style: { marginTop: 8, borderTop: "1px solid #cbd5e1", paddingTop: 8 } as any },
              h(View, { style: s.totalLine },
                h(Text, { style: s.grand }, "Totaal (indicatief)"),
                h(Text, { style: s.grand }, money(totals.total))
              )
            )
          ),

          // Notes
          notes
            ? h(View, { style: { marginTop: 10 } },
                h(Text, { style: s.h2 }, "Opmerking"),
                h(Text, null, notes)
              )
            : null
        ),

        // Footer
        h(Text, { style: s.footer },
          "Dit document is automatisch gegenereerd. Prijzen zijn indicatief en kunnen wijzigen na controle.  HETT Veranda \u2022 hettveranda.nl \u2022 info@hettveranda.nl"
        )
      )
    );

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
      },
      tls: {
        // Shared-hosting cert is issued to the server hostname
        // (s2.webhost.company) rather than mail.hettveranda.nl
        rejectUnauthorized: false
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
