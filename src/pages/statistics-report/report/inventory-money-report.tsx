import { currencyFormatter } from "@/lib/function"
import { ProductItem, StoreHouseWithProducts } from "@/types/types"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    borderStyle: "solid",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#888888",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#000000",
  },
  summaryItem: {
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  warehouseSection: {
    marginBottom: 25,
    pageBreakInside: false,
  },
  warehouseHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
    backgroundColor: "#F0F0F0",
    padding: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#000000",
  },
  warehouseSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#CCCCCC",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#E0E0E0",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    borderStyle: "solid",
  },
  tableHeaderCell: {
    margin: "auto",
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderStyle: "solid",
  },
  tableCell: {
    margin: "auto",
    padding: 6,
    fontSize: 9,
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#CCCCCC",
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    borderStyle: "solid",
  },
  tableCellProduct: {
    width: "50%",
  },
  tableCellStock: {
    width: "25%",
    textAlign: "center",
  },
  tableCellTotal: {
    width: "25%",
    textAlign: "right",
  },
  tableFooter: {
    backgroundColor: "#D0D0D0",
    borderTopWidth: 2,
    borderTopColor: "#000000",
    borderStyle: "solid",
  },
  tableFooterCell: {
    margin: "auto",
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderStyle: "solid",
  },
  grandTotal: {
    marginTop: 20,
    backgroundColor: "#E8E8E8",
    padding: 15,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#000000",
    textAlign: "center",
  },
  grandTotalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    borderStyle: "solid",
    paddingTop: 10,
  },
})

export const InventoryMoneyReport = ({ inventory }: { inventory: StoreHouseWithProducts[] }) => {
  const calculateWarehouseTotals = (products: ProductItem[]) => {
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
    const totalValue = products.reduce((sum, product) => sum + product.total, 0)
    return { totalStock, totalValue }
  }

  const grandTotalStock = inventory.reduce((sum, wh) => sum + wh.products.reduce((s, p) => s + p.stock, 0), 0)
  const grandTotalValue = inventory.reduce((sum, wh) => sum + wh.products.reduce((s, p) => s + p.total, 0), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte General de Inventario</Text>
          <Text style={styles.subtitle}>Todas las Bodegas</Text>
          <Text style={styles.date}>
            Generado el{" "}
            {new Date().toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Global Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL BODEGAS</Text>
            <Text style={styles.summaryValue}>{inventory.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>STOCK TOTAL</Text>
            <Text style={styles.summaryValue}>{grandTotalStock}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>INVENTARIO MONETARIO TOTAL</Text>
            <Text style={styles.summaryValue}>{currencyFormatter(grandTotalValue)}</Text>
          </View>
        </View>

        {/* Warehouses */}
        {inventory.map((warehouse, warehouseIndex) => {
          const { totalStock, totalValue } = calculateWarehouseTotals(warehouse.products)

          return (
            <View key={warehouseIndex} style={styles.warehouseSection} break={warehouseIndex > 0}>
              <Text style={styles.warehouseHeader}>{warehouse.storeHouseName}</Text>

              <View style={styles.warehouseSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>STOCK BODEGA</Text>
                  <Text style={styles.summaryValue}>{totalStock}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>INVENTARIO MONETARIO</Text>
                  <Text style={styles.summaryValue}>{currencyFormatter(totalValue)}</Text>
                </View>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableHeaderCell, styles.tableCellProduct]}>Producto</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableCellStock]}>Stock</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableCellTotal]}>Valor Total</Text>
                </View>

                {warehouse.products.map((product) => (
                  <View key={product.productId} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellProduct]}>{product.name}</Text>
                    <Text style={[styles.tableCell, styles.tableCellStock]}>{product.stock}</Text>
                    <Text style={[styles.tableCell, styles.tableCellTotal]}>{currencyFormatter(product.total)}</Text>
                  </View>
                ))}

                <View style={[styles.tableRow, styles.tableFooter]}>
                  <Text style={[styles.tableFooterCell, styles.tableCellProduct]}>TOTALES </Text>
                  <Text style={[styles.tableFooterCell, styles.tableCellStock]}>{totalStock}</Text>
                  <Text style={[styles.tableFooterCell, styles.tableCellTotal]}>{currencyFormatter(totalValue)}</Text>
                </View>
              </View>
            </View>
          )
        })}

        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalTitle}>RESUMEN GENERAL - TODAS LAS BODEGAS</Text>
          <View style={styles.grandTotalRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>STOCK TOTAL GENERAL</Text>
              <Text style={styles.summaryValue}>{grandTotalStock}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>INVENTARIO MONETARIO TOTAL GENERAL</Text>
              <Text style={styles.summaryValue}>{currencyFormatter(grandTotalValue)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Sistema de Gestión de Inventario - Reporte General Generado Automáticamente</Text>
      </Page>
    </Document>
  )
}
