import { currencyFormatter } from '@/lib/function';
import { RealSaleReportProps } from '@/types/types';
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
  dateColumn: {
    flex: 1.5,
  },
  codeColumn: {
    flex: 1.2,
  },
  typeColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 1.2,
  },
  realColumn: {
    flex: 1.2,
  },
  percentColumn: {
    flex: 1,
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

export default function RealSaleReportPDF({ sales }: { sales: RealSaleReportProps[] }) {
  const totalOf = (key: keyof RealSaleReportProps) =>
    sales.reduce((sum, item) => sum + Number(item[key] ?? 0), 0);

  const totalTotal = totalOf('total');
  const totalReal = totalOf('realTotal');
  const diferencia = totalTotal - totalReal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src="/images/hmc-logo.jpg" style={styles.logo} />
        <View style={styles.header}>
          <Text style={styles.title}>HMC LLANTAS</Text>
          <Text style={{ marginTop: 5 }}>REPORTE DE VENTAS BRUTAS</Text>
          <Text style={styles.subtitle}>
            {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString()} -{' '}
            {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString()}
          </Text>
          <View style={styles.underline} />
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.dateColumn]}>FECHA</Text>
            <Text style={[styles.tableCell, styles.codeColumn]}>CÓDIGO</Text>
            <Text style={[styles.tableCell, styles.typeColumn]}>TIPO</Text>
            <Text style={[styles.tableCell, styles.totalColumn]}>TOTAL</Text>
            <Text style={[styles.tableCell, styles.realColumn]}>PAGADO</Text>
            <Text style={[styles.tableCell, styles.percentColumn]}>% PAGADO</Text>
          </View>

          {sales.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.dateColumn]}>
                {new Date(item.createdAt).toLocaleDateString('es-ES')}
              </Text>
              <Text style={[styles.tableCell, styles.codeColumn]}>{item.salesCode}</Text>
              <Text style={[styles.tableCell, styles.typeColumn]}>
                {item.typeSale === 1 ? 'Contado' : 'Crédito'}
              </Text>
              <Text style={[styles.tableCell, styles.totalColumn]}>
                {currencyFormatter(item.total)}
              </Text>
              <Text style={[styles.tableCell, styles.realColumn]}>
                {currencyFormatter(item.realTotal)}
              </Text>
              <Text style={[styles.tableCell, styles.percentColumn]}>
                {item.percentagePaid?.toFixed(2)}%
              </Text>
            </View>
          ))}

          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.dateColumn]}>TOTALES</Text>
            <Text style={[styles.tableCell, styles.codeColumn]} />
            <Text style={[styles.tableCell, styles.typeColumn]} />
            <Text style={[styles.tableCell, styles.totalColumn]}>
              {currencyFormatter(totalTotal)}
            </Text>
            <Text style={[styles.tableCell, styles.realColumn]}>
              {currencyFormatter(totalReal)}
            </Text>
            <Text style={[styles.tableCell, styles.percentColumn]}>
              {currencyFormatter(diferencia)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>HMC LLANTAS</Text>
      </Page>
    </Document>
  );
}
