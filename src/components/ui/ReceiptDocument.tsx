import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type ReceiptItem = {
  id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type ReceiptOrder = {
  id: string;
  retailer_name: string;
  agent_name: string;
  total_amount: number;
  payment_mode?: string | null;
  created_at: string;
  items: ReceiptItem[];
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 18,
  },
  company: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: '#6b7280',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    fontWeight: 'semibold',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colProduct: { width: '44%' },
  colQty: { width: '14%', textAlign: 'right' },
  colUnit: { width: '21%', textAlign: 'right' },
  colTotal: { width: '21%', textAlign: 'right' },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  cellText: {
    fontSize: 9,
  },
  totalBox: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

function formatCurrency(value: number) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function ReceiptDocument({ order }: { order: ReceiptOrder }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.company}>FMCG Sales CRM</Text>
          <Text style={styles.title}>Order Receipt</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Retailer</Text>
              <Text style={styles.value}>{order.retailer_name}</Text>
            </View>
            <View>
              <Text style={styles.label}>Agent</Text>
              <Text style={styles.value}>{order.agent_name}</Text>
            </View>
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <View>
              <Text style={styles.label}>Payment mode</Text>
              <Text style={styles.value}>{order.payment_mode ?? 'Cash'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{new Date(order.created_at).toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colProduct]}>Product</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colUnit]}>Unit</Text>
            <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colProduct]}>{item.product_name ?? 'Product'}</Text>
              <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.colUnit]}>{formatCurrency(item.unit_price)}</Text>
              <Text style={[styles.cellText, styles.colTotal]}>{formatCurrency(item.line_total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total Amount: {formatCurrency(order.total_amount)}</Text>
        </View>
      </Page>
    </Document>
  );
}