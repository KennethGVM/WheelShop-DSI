import { currencyFormatter } from '@/lib/function';
import { PurchasesReportProps } from '@/types/types';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica-Bold',
  src: 'https://fonts.gstatic.com/s/helveticaneue/v11/CSR74zBvL7MA0OZ4Vw0jvQ.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 5,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 5,
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: '#000',
    marginVertical: 6,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#e4e4e4',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  totalRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 8,
    color: '#888',
  },
});

export default function PurchaseReport({ purchases, startDate, endDate }: { purchases: PurchasesReportProps[], startDate: Date, endDate: Date }) {
  const getTotalAmount = (data: typeof purchases) =>
    data.reduce((sum, item) => sum + (item.totalPurchaseAmount ?? 0), 0);

  const getTotalSales = (data: typeof purchases) =>
    data.reduce((sum, item) => sum + (item.totalPurchaseCount ?? 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src="/images/hmc-logo.jpg" style={styles.logo} />
        <View style={styles.header}>
          <Text style={styles.title}>HMC LLANTAS</Text>
          <Text style={{ marginTop: 5 }}>COMPRAS DIARIAS</Text>
          <Text style={styles.subtitle}>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</Text>
          <View style={styles.underline} />
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>FECHA</Text>
            <Text style={styles.tableCell}>TOTAL COMPRADO</Text>
            <Text style={styles.tableCell}>TOTAL COMPRA</Text>
          </View>

          {purchases.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.purchaseDay}</Text>
              <Text style={styles.tableCell}>
                {currencyFormatter(item.totalPurchaseAmount) ?? '0'}
              </Text>
              <Text style={styles.tableCell}>
                {item.totalPurchaseCount?.toLocaleString() ?? '0'}
              </Text>
            </View>
          ))}

          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={styles.tableCell}>TOTAL DEL MES</Text>
            <Text style={styles.tableCell}>
              {currencyFormatter(getTotalAmount(purchases).toLocaleString())}
            </Text>
            <Text style={styles.tableCell}>
              {getTotalSales(purchases).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>HMC LLANTAS</Text>
      </Page>
    </Document>
  );
}
