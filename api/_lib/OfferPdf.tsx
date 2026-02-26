import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from "@react-pdf/renderer";

// (optioneel) eigen font, anders weglaten:
// Font.register({ family: "Inter", src: "https://..." })

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  brand: { fontSize: 18, fontWeight: 700, color: "#003878" },
  sub: { fontSize: 10, color: "#475569", marginTop: 4 },
  badge: { backgroundColor: "#FF7300", padding: 8, borderRadius: 8, color: "#fff", fontSize: 10 },
  section: { marginTop: 16, paddingTop: 12, borderTop: "1px solid #e2e8f0" },
  h2: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#003878" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1px solid #f1f5f9" },
  label: { color: "#334155" },
  value: { color: "#0f172a", fontWeight: 600 },
  totalsBox: { marginTop: 12, padding: 12, backgroundColor: "#EDF0F2", borderRadius: 10 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: { fontSize: 14, fontWeight: 800, color: "#003878" },
  imgWrap: { marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" },
  footer: { marginTop: 18, fontSize: 9, color: "#64748b" }
});

type OptionLine = { label: string; value: string; price?: number };
type Totals = { base?: number; options?: number; shipping?: number; total?: number };

export function OfferPdf(props: {
  reference: string;
  createdAt: string;
  productTitle: string;
  productHandle?: string;
  previewImageUrl?: string;
  contact: { name?: string; email: string; phone?: string; postcode?: string; city?: string };
  options: OptionLine[];
  totals?: Totals;
  notes?: string;
}) {
  const { reference, createdAt, productTitle, previewImageUrl, contact, options, totals, notes } = props;

  const money = (n?: number) =>
    typeof n === "number" ? `€ ${n.toFixed(2).replace(".", ",")}` : "—";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>HETT Veranda</Text>
            <Text style={styles.sub}>Offerteaanvraag • Hoppenkuil 17, 5626DD Eindhoven</Text>
            <Text style={styles.sub}>Referentie: {reference} • {createdAt}</Text>
          </View>
          <View>
            <Text style={styles.badge}>Offerteaanvraag</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Klantgegevens</Text>
          <View style={styles.row}><Text style={styles.label}>Naam</Text><Text style={styles.value}>{contact.name || "—"}</Text></View>
          <View style={styles.row}><Text style={styles.label}>E-mail</Text><Text style={styles.value}>{contact.email}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Telefoon</Text><Text style={styles.value}>{contact.phone || "—"}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Postcode / Plaats</Text><Text style={styles.value}>{`${contact.postcode || "—"} ${contact.city || ""}`}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Product</Text>
          <View style={styles.row}><Text style={styles.label}>Product</Text><Text style={styles.value}>{productTitle}</Text></View>

          {previewImageUrl ? (
            <View style={styles.imgWrap}>
              <Image src={previewImageUrl} style={{ width: "100%", height: 220, objectFit: "cover" }} />
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Configuratie</Text>
          {options.length ? (
            options.map((o, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.label}>{o.label}</Text>
                <Text style={styles.value}>
                  {o.value}{typeof o.price === "number" ? `  (${money(o.price)})` : ""}
                </Text>
              </View>
            ))
          ) : (
            <Text>—</Text>
          )}

          <View style={styles.totalsBox}>
            <View style={styles.totalLine}><Text>Basisprijs</Text><Text style={{ fontWeight: 700 }}>{money(totals?.base)}</Text></View>
            <View style={styles.totalLine}><Text>Opties</Text><Text style={{ fontWeight: 700 }}>{money(totals?.options)}</Text></View>
            <View style={styles.totalLine}><Text>Verzending</Text><Text style={{ fontWeight: 700 }}>{money(totals?.shipping)}</Text></View>
            <View style={{ marginTop: 8, borderTop: "1px solid #cbd5e1", paddingTop: 8 }}>
              <View style={styles.totalLine}>
                <Text style={styles.grand}>Totaal (indicatief)</Text>
                <Text style={styles.grand}>{money(totals?.total)}</Text>
              </View>
            </View>
          </View>

          {notes ? (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.h2}>Opmerking</Text>
              <Text>{notes}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footer}>
          Dit document is automatisch gegenereerd. Prijzen zijn indicatief en kunnen wijzigen na controle.  
          HETT Veranda • hettveranda.nl • info@hettveranda.nl
        </Text>
      </Page>
    </Document>
  );
}
