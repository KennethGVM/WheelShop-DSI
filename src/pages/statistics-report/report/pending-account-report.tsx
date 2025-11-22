import { currencyFormatter } from '@/lib/function';
import { PendingAccountProps } from '@/types/types';
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
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  // Column widths
  ventaColumn: {
    flex: 1,
  },
  clienteColumn: {
    flex: 2.5, // más ancho
  },
  expColumn: {
    flex: 1.2,
  },
  diasColumn: {
    flex: 1.2,
  },
  totalColumn: {
    flex: 1.2,
  },
  saldoColumn: {
    flex: 1.2,
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

export default function PendingAccountReport({
  pendingAccount,
}: {
  pendingAccount: PendingAccountProps[];
}) {
  const getTotalSales = (data: typeof pendingAccount) =>
    data.reduce((sum, item) => sum + (item.total ?? 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src="/images/hmc-logo.jpg" style={styles.logo} />
        <View style={styles.header}>
          <Text style={styles.title}>HMC LLANTAS</Text>
          <Text style={{ marginTop: 5 }}>CLIENTES CON CUENTAS PENDIENTES</Text>
          <Text style={styles.subtitle}>
            {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString()} -{' '}
            {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString()}
          </Text>
          <View style={styles.underline} />
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.ventaColumn]}>VENTA</Text>
            <Text style={[styles.tableCell, styles.clienteColumn]}>CLIENTE</Text>
            <Text style={[styles.tableCell, styles.expColumn]}>EXPIRACIÓN</Text>
            <Text style={[styles.tableCell, styles.diasColumn]}>PENDIENTES</Text>
            <Text style={[styles.tableCell, styles.totalColumn]}>TOTAL</Text>
            <Text style={[styles.tableCell, styles.saldoColumn]}>SALDO</Text>
          </View>

          {pendingAccount.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.ventaColumn]}>{item.salesCode}</Text>
              <Text style={[styles.tableCell, styles.clienteColumn]}>{item.customerName}</Text>
              <Text style={[styles.tableCell, styles.expColumn]}>
                {new Date(item.expirationDate ?? new Date()).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.tableCell, styles.diasColumn]}>{item.daysPending} dias</Text>
              <Text style={[styles.tableCell, styles.totalColumn]}>
                {currencyFormatter(item.total?.toLocaleString()) ?? '0'}
              </Text>
              <Text style={[styles.tableCell, styles.saldoColumn]}>
                {currencyFormatter(item.saldo) ?? '0'}
              </Text>
            </View>
          ))}

          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.ventaColumn]}>TOTAL DEL MES</Text>
            <Text style={[styles.tableCell, styles.clienteColumn]} />
            <Text style={[styles.tableCell, styles.expColumn]} />
            <Text style={[styles.tableCell, styles.diasColumn]} />
            <Text style={[styles.tableCell, styles.totalColumn]}>
              {getTotalSales(pendingAccount).toLocaleString()}
            </Text>
            <Text style={[styles.tableCell, styles.saldoColumn]} />
          </View>
        </View>

        <Text style={styles.footer}>HMC LLANTAS</Text>
      </Page>
    </Document>
  );
}
