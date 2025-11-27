import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { InventoryReportProps, PendingAccountProps, ProductReportProps, PurchasesReportProps, RealSaleReportProps, ReportProps, SalesReportProps, StoreHouseProps, StoreHouseWithProducts, TransferReportProps } from '@/types/types';
import { SearchIcon } from '@/icons/icons';
import StatusTags from '@/components/status-tags';
import ReportTableHeader from './report-table-header';
import ReportTableRow from './report-table-row';
import Modal from '@/components/modal';
import DateTimePicker from '@/components/form/datetimepicker';
import { pdf } from '@react-pdf/renderer';
import SalesReport from './sales-report';
import { supabase } from '@/api/supabase-client';
import { showToast } from '@/components/toast';
import PurchaseReport from './purchase-report';
import ProductReport from './product-report';
import TransferReport from './transfer-report';
import InventoryReport from './inventory-report';
import PendingAccountReport from './pending-account-report';
import RealSaleReportPDF from './real-sale-report';
import { InventoryMoneyReport } from './inventory-money-report';
import FieldSelect from '@/components/form/field-select';

interface ReportTableProps {
  reports: ReportProps[];
  setReports: Dispatch<SetStateAction<ReportProps[]>>;
}

export default function ReportTable({ reports, setReports }: ReportTableProps) {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [sales, setSales] = useState<SalesReportProps[]>([]);
  const [tireSales, setTireSales] = useState<SalesReportProps[]>([]);
  const [purchases, setPurchases] = useState<PurchasesReportProps[]>([]);
  const [productMostSale, setProductMostSale] = useState<ProductReportProps[]>([]);
  const [productLessSale, setProductLessSale] = useState<ProductReportProps[]>([]);
  const [transfer, setTransfer] = useState<TransferReportProps[]>([]);
  const [inventory, setInventory] = useState<InventoryReportProps[]>([]);
  const [pendingAccount, setPendingAccount] = useState<PendingAccountProps[]>([]);
  const [grossSales, setGrossSales] = useState<RealSaleReportProps[]>([]);
  const [inventoryMoney, setInventoryMoney] = useState<StoreHouseWithProducts[]>([]);
  const [storeHouse, setStoreHouse] = useState<StoreHouseProps[]>([]);
  const [selectedStoreHouse, setSelectedStoreHouse] = useState<string>('');

  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

const ReportName = {
    MonthlySales: 'Ventas mensuales',
    MonthlyGrossSales: 'Ventas brutas mensuales',
    MonthlyTireSales: 'Ventas de llantas mensuales',
    MonthlyPurchases: 'Compras mensuales',
    CustomersWithPendingAccounts: 'Clientes con cuentas pendientes',
    BestSellingProducts: 'Productos mas vendidos',
    WorstSellingProducts: 'Productos menos vendidos',
    EndOfMonthInventory: 'Inventario final del mes',
    WarehouseTransfers: 'Traslados de bodegas',
    InventoryMoney: 'Inventario final monetario',
    InventoryMoneyByStore: 'Inventario final monetario por bodega',
  } as const;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollLeft > 0);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const HEADERS = [
    { title: "Reporte", isNumeric: false, className: 'sticky' },
    { title: "Estado", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Categoria", isNumeric: false },
  ];

  const handleShowReport = (report: string) => {
    setIsShowModal(true);
    setSelectedReport(report)
  }

  useEffect(() => {
    const handleLoadSales = async () => {
      const { data, error } = await supabase.rpc('getsalesreport', { end_date: formData.endDate.toISOString().split('T')[0], start_date: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setSales(data);
    }

    const handleLoadTireSales = async () => {
      const { data, error } = await supabase.rpc('getsaleswheelreport', { enddate: formData.endDate.toISOString().split('T')[0], startdate: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setTireSales(data);
    }

    const handleLoadPurchases = async () => {
      const { data, error } = await supabase.rpc('getpurchasereport', { end_date: formData.endDate.toISOString().split('T')[0], start_date: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setPurchases(data);
    }

    const handleLoadMostProduct = async () => {
      const { data, error } = await supabase.rpc('getproductmostsale', { end_date: formData.endDate.toISOString().split('T')[0], start_date: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setProductMostSale(data);
    }

    const handleLoadLessProduct = async () => {
      const { data, error } = await supabase.rpc('getproductlesssale', { end_date: formData.endDate.toISOString().split('T')[0], start_date: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setProductLessSale(data);
    }

    const handleLoadTransfers = async () => {
      const { data, error } = await supabase.rpc('gettransferreport', { end_date: formData.endDate.toISOString().split('T')[0], start_date: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setTransfer(data);
    }

    const handleLoadInventory = async () => {
      const { data, error } = await supabase.from('getinventoryreport').select('*');
      if (error) {
        showToast(error.message, false);
        return;
      }

      setInventory(data);
    }

    const handleLoadPendingAccount = async () => {
      const { data, error } = await supabase.from('getpendingaccounts').select('*');
      if (error) {
        showToast(error.message, false);
        return;
      }

      setPendingAccount(data);
    }

    const handleLoadGrossSales = async () => {
      const { data, error } = await supabase.rpc('getrealsalereport', { end_date: formData.endDate.toISOString().split('T')[0], start_date: formData.startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return
      }

      setGrossSales(data);
    }

    const handleLoadInventoryMoney = async () => {
      const { data, error } = await supabase.from('get_total_inventory_money').select('*');
      if (error) {
        showToast(error.message, false);
        return;
      }

      setInventoryMoney(data);
    }

    if (selectedReport === ReportName.MonthlySales) handleLoadSales();
    if (selectedReport === ReportName.MonthlyGrossSales) handleLoadGrossSales();
    if (selectedReport === ReportName.MonthlyTireSales) handleLoadTireSales();
    if (selectedReport === ReportName.MonthlyPurchases) handleLoadPurchases();
    if (selectedReport === ReportName.BestSellingProducts) handleLoadMostProduct();
    if (selectedReport === ReportName.WorstSellingProducts) handleLoadLessProduct();
    if (selectedReport === ReportName.WarehouseTransfers) handleLoadTransfers();
    if (selectedReport === ReportName.EndOfMonthInventory) handleLoadInventory();
    if (selectedReport === ReportName.CustomersWithPendingAccounts) handleLoadPendingAccount();
    if (selectedReport === ReportName.InventoryMoney) handleLoadInventoryMoney();
    if (selectedReport === ReportName.InventoryMoneyByStore) handleLoadInventoryMoney();
  }, [formData.startDate, formData.endDate, selectedReport])

  useEffect(() => {
    const handleLoadStoreHouse = async () => {
      const { data, error } = await supabase.from('storeHouse').select('*');
      if (error) {
        showToast(error.message, false);
        return;
      }

      setStoreHouse(data);
      setSelectedStoreHouse(data[0].storeHouseId);
    }

    handleLoadStoreHouse();
  }, [])

  const handlePrint = async () => {
    let report = null;
    if (selectedReport === ReportName.MonthlySales) report = <SalesReport startDate={formData.startDate} endDate={formData.endDate} sales={sales} name='VENTAS DIARIAS' />;
    if (selectedReport === ReportName.MonthlyTireSales) report = <SalesReport startDate={formData.startDate} endDate={formData.endDate} sales={tireSales} name='Ventas DE LLANTAS DIARIAS' />;
    if (selectedReport === ReportName.MonthlyPurchases) report = <PurchaseReport startDate={formData.startDate} endDate={formData.endDate} purchases={purchases} />;
    if (selectedReport === ReportName.BestSellingProducts) report = <ProductReport startDate={formData.startDate} endDate={formData.endDate} products={productMostSale} name='PRODUCTOS MAS VENDIDOS' />;
    if (selectedReport === ReportName.WorstSellingProducts) report = <ProductReport startDate={formData.startDate} endDate={formData.endDate} products={productLessSale} name='PRODUCTOS MENOS VENDIDOS' />;
    if (selectedReport === ReportName.WarehouseTransfers) report = <TransferReport startDate={formData.startDate} endDate={formData.endDate} transfers={transfer} />;
    if (selectedReport === ReportName.EndOfMonthInventory) report = <InventoryReport inventory={inventory} />;
    if (selectedReport === ReportName.CustomersWithPendingAccounts) report = <PendingAccountReport pendingAccount={pendingAccount} />;
    if (selectedReport === ReportName.MonthlyGrossSales) report = <RealSaleReportPDF sales={grossSales} />;
    if (selectedReport === ReportName.InventoryMoney) report = <InventoryMoneyReport inventory={inventoryMoney} />;
    if (selectedReport === ReportName.InventoryMoneyByStore) report = <InventoryMoneyReport inventory={inventoryMoney.filter(inventory => inventory.storeHouseName === storeHouse.find(store => store.storeHouseId === selectedStoreHouse)?.name)} />;
    if (!report) return;

    const blob = await pdf(report).toBlob();

    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url);

    printWindow?.focus();
    printWindow?.print();

    printWindow?.addEventListener('afterprint', () => {
      URL.revokeObjectURL(url);
      printWindow.close();
    });

    setIsShowModal(false)
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full bg-white min-w-[1200px]">
          <ReportTableHeader
            isScrolled={isScrolled}
            HEADERS={HEADERS}
            reports={reports}
            setReports={setReports}
          />
          <tbody>
            {reports && reports.length > 0 ? (
              reports.map((report, key) => (
                <ReportTableRow
                  key={key}
                  handleShowReport={handleShowReport}
                  isScrolled={isScrolled}
                  reports={reports}
                  report={report}
                />
              ))
            ) : (
              <tr>
                <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                  <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                    <SearchIcon className='size-16 fill-[#8c9196]' />
                    <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de reportes</p>
                    <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`bg-white sm:hidden block border-gray-300 py-2 ${reports.length > 0 ? 'border-t' : ''}`}>
        {reports && reports.length > 0 ? (
          reports.map((report, index) => (
            <div className={`flex px-4 py-2 items-center justify-between border-gray-300 ${reports.length - 1 === index ? 'border-none' : 'border-b'}`} key={index}>
              <div className="flex flex-col space-y-1">
                <span className="font-semibold text-base text-secondary/80">{report.name}</span>
                <span className="text-secondary/80 max-w-[90%] font-medium text-sm">Venta</span>
              </div>

              <div className='flex flex-col space-y-1'>
                <StatusTags status text="Activo" className='px-1.5 rounded-lg py-0.5' />
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-center text-xl'>No se encontró ningún recurso de inventario</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {isShowModal &&
        <Modal classNameModal={`px-4 py-3 ${selectedReport === ReportName.EndOfMonthInventory || selectedReport === ReportName.CustomersWithPendingAccounts || selectedReport === ReportName.InventoryMoney ? '' : 'h-[400px]'}`} principalButtonName='Imprimir' onClickSave={handlePrint} name={selectedReport} onClose={() => setIsShowModal(false)}>
          {selectedReport === ReportName.EndOfMonthInventory || selectedReport === ReportName.CustomersWithPendingAccounts || selectedReport === ReportName.InventoryMoney ? (
            <p className='font-medium text-2xs text-secondary/80'>¿Estas seguro que quieres imprimir el reporte de {selectedReport === ReportName.EndOfMonthInventory ? 'inventario mensual' : selectedReport === ReportName.CustomersWithPendingAccounts ? 'clientes con cuentas pendientes' : 'inventario monetario'}?</p>
          ) : selectedReport === ReportName.InventoryMoneyByStore ? (
            <>
              <FieldSelect
                name='Bodega'
                options={storeHouse.map(storeHouse => ({ name: storeHouse.name, value: storeHouse.storeHouseId }))}
                id='storeHouse'
                value={selectedStoreHouse}
                onChange={(e) => setSelectedStoreHouse(e.target.value)}
              />
            </>
          ) : (
            <>
              <DateTimePicker name='Fecha de inicio' value={formData.startDate} onChange={(value) => setFormData({ ...formData, startDate: value })} />
              <DateTimePicker className='mt-4' name='Fecha de fin' value={formData.endDate} onChange={(value) => setFormData({ ...formData, endDate: value })} />
            </>
          )}
        </Modal>
      }
    </>
  )
}
