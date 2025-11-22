
import { useRef } from "react"
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from "@react-pdf/renderer"
import Modal from "@/components/modal"
import { useGeneralInformation } from "@/api/general-provider"
import { currencyFormatter } from "@/lib/function"

// Registro de fuente Arial para react-pdf (opcional, si quieres usar fuentes locales)
// Font.register({
//   family: "Arial",
//   fonts: [{ src: "/fonts/arial.ttf" }],
// });

interface ProductItem {
  productId: string
  name: string
  quantity: number
  cost: number
  discount: number
}

interface QuotationBillProps {
  quotationNumber: string
  date: string
  customerName: string
  customerLastName: string
  customerRuc?: string
  customerPhone?: string
  customerEmail?: string
  products: ProductItem[]
  observations: string
  shippingCost: number
  subTotal: number
  total: number
  discount: number
  isOpen: boolean
  onClose: () => void
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 30,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  logo: {
    width: 210,
    height: 120,
    objectFit: "contain",
  },
  companyInfo: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 20,
    lineHeight: 1.1,
  },
  titleSection: {
    textAlign: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,

  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 20,

  },
  customerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  customerDetails: {
    flex: 1,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 90,
    fontWeight: "bold",
  },
  rightAligned: {
    textAlign: "right",
  },
  productsTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  tableCellQty: {
    width: 90,
    borderRightWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    padding: 4,
  },
  tableCellName: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#ccc",
    padding: 4,
  },
  tableCellCost: {
    width: 110,
    borderRightWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    padding: 4,
  },
  tableCellTotal: {
    width: 110,
    textAlign: "center",
    padding: 4,
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    width: "100%",
  },
  totalLabel: {
    width: 140,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "right",
    paddingRight: 12,
    alignSelf: "center",
  },
  totalValue: {
    width: 110,        // ancho igual a la columna TOTAL
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    alignSelf: "center",
  },
  notesSection: {
    marginTop: 15,
    fontSize: 12,
    lineHeight: 1.2,
  },
  bankGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  bankItem: {
    flex: 1,
    fontSize: 12,
  },
  signatureSection: {
    marginTop: 25,
    fontSize: 13,
  },
  observationsSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  observationsTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 9,
  },
})

function QuotationDocument({ data }: { data: QuotationBillProps; companyName: string }) {
  return (
    <Document title={`Cotización ${data.quotationNumber} para ${data.customerName} ${data.customerLastName}`}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image src="/images/hmc-logo.jpg" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>Km 41, Gasolinera UNO,</Text>
            <Text>60 metros al oeste, Nagarote, León.</Text>
            <Text>Tel: (+505) 8985-9255</Text>
            <Text>email: hmcllantas@gmail.com</Text>
            <Text style={{ marginTop: 5, fontWeight: "bold" }}>RUC 00103128300397</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>PROFORMA</Text>
          <Text style={styles.subtitle}>CONTRIBUYENTE DE CUOTA FIJA</Text>
        </View>

        {/* Customer & Quotation info */}
        <View style={styles.customerSection}>
          <View style={styles.customerDetails}>
            <View style={styles.row}>
              <Text style={styles.label}>Cliente</Text>
              <Text>{data.customerName + " " + data.customerLastName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>N° Identifación</Text>
              <Text>{data.customerRuc || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono</Text>
              <Text>{data.customerPhone || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>email</Text>
              <Text>{data.customerEmail || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha</Text>
              <Text>{data.date}</Text>
            </View>
          </View>
          <View style={{ flexBasis: 150, justifyContent: "center", alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>{data.quotationNumber}</Text>
          </View>
        </View>

        {/* Intro text */}
        <Text style={{ fontSize: 12, marginBottom: 6 }}>
          A continuación detallamos productos de su interés para su valoración
        </Text>

        {/* Products Table */}
        <View style={styles.productsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellQty}>CANTIDAD</Text>
            <Text style={styles.tableCellName}>ITEM</Text>
            <Text style={styles.tableCellCost}>COSTO UNITARIO</Text>
            <Text style={styles.tableCellTotal}>TOTAL</Text>
          </View>
          {data.products.map((product) => {
            const unitPrice = product.cost - product.discount
            return (
              <View style={styles.tableRow} key={product.productId}>
                <Text style={styles.tableCellQty}>{product.quantity}</Text>
                <Text style={styles.tableCellName}>{product.name}</Text>
                <Text style={styles.tableCellCost}>{currencyFormatter(unitPrice)}</Text>
                <Text style={styles.tableCellTotal}>
                  {currencyFormatter(product.quantity * unitPrice)}
                </Text>
              </View>
            )
          })}
        </View>
        <View style={{ ...styles.totalContainer, flexDirection: "column", alignItems: "flex-end" }}>
          {/* Subtotal siempre mostrado */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{currencyFormatter(data.subTotal)}</Text>
          </View>

          {/* Mostrar descuento sólo si es mayor que 0 */}
          {data.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento</Text>
              <Text style={styles.totalValue}>{currencyFormatter(data.discount)}</Text>
            </View>
          )}

          {/* Mostrar envío sólo si es mayor que 0 */}
          {data.shippingCost > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío</Text>
              <Text style={styles.totalValue}>{currencyFormatter(data.shippingCost)}</Text>
            </View>
          )}

          {/* Total siempre mostrado */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{currencyFormatter(data.total)}</Text>
          </View>
        </View>

        {/* Notes & Payment */}
        <View style={styles.notesSection}>
          <Text>
            Agradeceremos su confirmación de compra al correo hugo-83@hotmail.com
          </Text>
          <Text>o bien al número 8985-9255</Text>
          <Text style={{ marginTop: 6 }}>Pagos por cheque a nombre de Hugo Morales Corea</Text>
          <Text style={{ marginTop: 2 }}>Transferencias o depósitos a las cuentas a nombre de Hugo Morales Corea</Text>

          <View style={styles.bankGrid}>
            <View style={styles.bankItem}>
              <Text style={{ fontWeight: "bold" }}>BANPRO</Text>
              <Text>Córdobas: 10024000020236</Text>
              <Text>Dólares: 10024010012421</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={{ fontWeight: "bold" }}>BANCENTRO</Text>
              <Text>Córdobas: 129070455</Text>
              <Text>Dólares: 109285827</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={{ fontWeight: "bold" }}>BAC</Text>
              <Text>Córdobas: 370315376</Text>
              <Text>Dólares: 370315442</Text>
            </View>
          </View>

          <View style={styles.signatureSection}>
            <Text>A sus gratas órdenes,</Text>
            <Text style={{ fontWeight: "bold" }}>Hugo Morales Corea</Text>
            <Text style={{ fontWeight: "bold" }}>HMC LLANTAS</Text>

          </View>
        </View>

        {/* Observations */}
        {data.observations && (
          <View style={styles.observationsSection}>
            <Text style={styles.observationsTitle}>OBSERVACIONES</Text>
            <Text style={styles.observationsText}>{data.observations}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

export default function QuotationBill({ quotationData }: { quotationData: QuotationBillProps }) {
  const { companyName } = useGeneralInformation()
  const viewerRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!viewerRef.current) return

    const iframe = viewerRef.current.querySelector("iframe") as HTMLIFrameElement | null
    if (!iframe || !iframe.contentWindow) return

    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }

  if (!quotationData.isOpen) return null

  return (
    <Modal
      name="Proforma"
      onClose={() => quotationData.onClose()}
      onClickSave={handlePrint}
      principalButtonName="Imprimir"
      classNameModal="md:max-h-[95vh]"
      className="md:max-w-4xl"
    >
      <div className="bg-white">
        <div
          className="max-h-[78vh] overflow-y-auto"
          ref={viewerRef}
          style={{ minHeight: "700px" }}
        >
          <PDFViewer
            style={{ width: "100%", height: "700px", border: "none" }}
            showToolbar={false}
          >
            <QuotationDocument data={quotationData} companyName={companyName} />
          </PDFViewer>
        </div>
      </div>
    </Modal>
  )
}
