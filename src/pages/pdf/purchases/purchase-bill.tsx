import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { currencyFormatter } from "@/lib/function"

interface ProductItem {
  productId: string
  name: string
  quantity: number
  cost: number
}

interface QuotationBillProps {
  codePurchaseOrder: string
  date: string
  supplierName: string
  products: ProductItem[]
  observations: string
  shippingCost: number
  subTotal: number
  total: number
  discount: number
  typePurchase: boolean
  expirationDate: string
  currencyName: string
  paymentMethodName: string
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
    marginBottom: 6,
  },
  label: {
    width: 120,
    fontWeight: "bold",
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
  totalsBlock: {
    marginTop: 10,
    alignItems: "flex-end",
    width: "100%",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 190,
    marginTop: 5,
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  totalValue: {
    fontSize: 12,
    textAlign: "right",
    width: 100,
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

export default function PurchaseBill({ data }: { data: QuotationBillProps }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
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

        <View style={styles.titleSection}>
          <Text style={styles.title}>Orden de compra</Text>
          <Text style={styles.subtitle}>CONTRIBUYENTE DE CUOTA FIJA</Text>
        </View>

        <View style={styles.customerSection}>
          <View style={styles.customerDetails}>
            <View style={styles.row}>
              <Text style={styles.label}>Proveedor</Text>
              <Text>{data.supplierName}</Text>
            </View>
            {data.typePurchase && (
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de expiración</Text>
                <Text>{data.expirationDate}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Moneda</Text>
              <Text>{data.currencyName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Método de pago</Text>
              <Text>{data.paymentMethodName}</Text>
            </View>
          </View>
          <View style={{ flexBasis: 150, justifyContent: "center", alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>{data.codePurchaseOrder}</Text>
          </View>
        </View>

        <View style={styles.productsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellQty}>CANTIDAD</Text>
            <Text style={styles.tableCellName}>ITEM</Text>
            <Text style={styles.tableCellCost}>COSTO UNITARIO</Text>
            <Text style={styles.tableCellTotal}>TOTAL</Text>
          </View>
          {data.products.map((product) => (
            <View style={styles.tableRow} key={product.productId}>
              <Text style={styles.tableCellQty}>{product.quantity}</Text>
              <Text style={styles.tableCellName}>{product.name}</Text>
              <Text style={styles.tableCellCost}>{currencyFormatter(product.cost)}</Text>
              <Text style={styles.tableCellTotal}>
                {currencyFormatter(product.quantity * product.cost)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{currencyFormatter(data.subTotal)}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Descuento</Text>
            <Text style={styles.totalValue}>{currencyFormatter(data.discount)}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Costo de envío</Text>
            <Text style={styles.totalValue}>{currencyFormatter(data.shippingCost)}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{currencyFormatter(data.total)}</Text>
          </View>
        </View>

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
