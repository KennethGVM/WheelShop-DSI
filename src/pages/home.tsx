import { useRolePermission } from '@/api/permissions-provider';
import Container from '@/layout/container';
import { currencyFormatter, getPermissions } from '@/lib/function';
import AccessPage from './access-page';
import { LineChart, BarChart } from '@shopify/polaris-viz';
import '@shopify/polaris-viz/build/esm/styles.css';
import FormSection from '@/layout/form-section';
import DatePicker from '@/components/form/date-picker';
import { useEffect, useState } from 'react';
import { supabase } from '@/api/supabase-client';
import { showToast } from '@/components/toast';
import { ProductReportProps, StoreHouseProps, TotalInventoryProps } from '@/types/types';
import Button from '@/components/form/button';
import { CheckIcon, StoreHouseMoneyIcon } from '@/icons/icons';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';


interface DailyTotal {
  date: string;
  total: number;
}

interface TotalsGroupedByType {
  sale: DailyTotal[];
  purchase: DailyTotal[];
  expense: DailyTotal[];
  return: DailyTotal[];
  comissions: DailyTotal[];
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatDateKey(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' });
}

export default function Home() {
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeHome = getPermissions(permissions, 'Inicio', 'Inicio')?.canAccess;

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState<Date>(sevenDaysAgo);
  const [storeHouse, setStoreHouse] = useState<StoreHouseProps[]>([]);
  const [selectedStoreHouse, setSelectedStoreHouse] = useState<StoreHouseProps | null>(null);
  const [endDate, setEndDate] = useState<Date>(today);
  const [report, setReport] = useState<TotalsGroupedByType | null>(null);
  const [productMostSale, setProductMostSale] = useState<ProductReportProps[]>([]);
  const [productLessSale, setProductLessSale] = useState<ProductReportProps[]>([]);
  const [selectedType, setSelectedType] = useState<number>(0);
  const [totalInventory, setTotalInventory] = useState<TotalInventoryProps>();
  const [typeReportTotals, setTypeReportTotals] = useState([
    { name: 'Ventas totales', value: 0 },
    { name: 'Pedidos', value: 0 },
    { name: 'Gastos', value: 0 },
    { name: 'Devoluciones', value: 0 },
  ]);

  useEffect(() => {
    const handleLoadStoreHouse = async () => {
      const { data } = await supabase.from("storeHouse").select("*");
      if (!data || data.length === 0) return;

      setStoreHouse(data as StoreHouseProps[]);
      setSelectedStoreHouse(data[0]);
    };
    handleLoadStoreHouse();
  }, []);

  useEffect(() => {
    const handleLoadTotalInventory = async () => {
      const { data } = await supabase.from("get_total_inventory").select("*").eq('storeHouseId', selectedStoreHouse?.storeHouseId).single();
      if (!data || data.length === 0) return;

      setTotalInventory(data);
    }

    handleLoadTotalInventory();
  }, [selectedStoreHouse])

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .rpc('get_totals_grouped_by_type', {
          startdate: formatDate(startDate),
          enddate: formatDate(endDate),
        })
        .single<TotalsGroupedByType>();

      if (error) {
        showToast(error.message, false);
        return;
      }

      setReport(data);

      setTypeReportTotals([
        { name: 'Ventas totales', value: (data.sale?.reduce((a, b) => a + Number(b.total), 0) ?? 0) - (data.comissions?.reduce((a, b) => a + Number(b.total), 0) ?? 0) },
        { name: 'Pedidos', value: data.purchase?.reduce((a, b) => a + Number(b.total), 0) ?? 0 },
        { name: 'Gastos', value: data.expense?.reduce((a, b) => a + Number(b.total), 0) ?? 0 },
        { name: 'Devoluciones', value: data.return?.reduce((a, b) => a + Number(b.total), 0) ?? 0 },
        { name: 'Comisiones', value: data.comissions?.reduce((a, b) => a + Number(b.total), 0) ?? 0 },
      ]);
    };

    const handleLoadMostProduct = async () => {
      const { data, error } = await supabase.rpc('getproductmostsale', { end_date: endDate.toISOString().split('T')[0], start_date: startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setProductMostSale(data);
    }

    const handleLoadLessProduct = async () => {
      const { data, error } = await supabase.rpc('getproductlesssale', { end_date: endDate.toISOString().split('T')[0], start_date: startDate.toISOString().split('T')[0] });
      if (error) {
        showToast(error.message, false);
        return;
      }

      setProductLessSale(data);
    }
    fetchReport();
    handleLoadMostProduct()
    handleLoadLessProduct();
  }, [startDate, endDate]);

  const selectedDataKey = ['sale', 'purchase', 'expense', 'return', 'comissions'][selectedType] as keyof TotalsGroupedByType;

  const lineChartData = report && report[selectedDataKey]
    ? [
      {
        name: typeReportTotals[selectedType].name,
        data: report[selectedDataKey]?.map(({ date, total }) => ({
          key: formatDateKey(date),
          value: Number(total),
        })) ?? [],
      },
    ]
    : [
      {
        name: typeReportTotals[selectedType].name,
        data: [],
      },
    ];

  const productMostSaleData = [
    {
      name: 'Productos más vendidos',
      data: productMostSale.map((product) => ({
        key: product.name,
        value: product.totalAmountSold,
      })),
    },
  ];

  const productLessSaleData = [
    {
      name: 'Productos menos vendidos',
      data: productLessSale.map((product) => ({
        key: product.name,
        value: product.totalAmountSold,
      })),
    },
  ];

  return (
    <Container>
      {canSeeHome ? (
        <div className="max-w-5xl mx-auto">
          <div className='md:px-0 px-4 '>
            <DatePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                if (start) setStartDate(new Date(start.toISOString().split("T")[0]));
                if (end) setEndDate(new Date(end.toISOString().split("T")[0]));
              }}
            />
          </div>

          <FormSection className="p-0">
            <div className="flex items-center">
              <div className="min-w-fit px-2 border-r py-3 border-gray-300 flex-shrink-0">
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1.5 px-4 py-3 text-secondary/80 md:text-2xs text-base font-[550] bg-white hover:bg-[#f3f3f3]">
                      <StoreHouseMoneyIcon className="size-5 stroke-none fill-secondary/80" />
                      <span className="font-medium">{selectedStoreHouse?.name}</span>
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent className="w-60 rounded-xl mt-1 space-y-1" align="start">
                    {storeHouse.map((storeHouse) => (
                      <DropdownItem
                        key={storeHouse.storeHouseId}
                        onClick={() => setSelectedStoreHouse(storeHouse)}
                        className={`flex items-center justify-between ${selectedStoreHouse?.storeHouseId === storeHouse.storeHouseId
                          ? "bg-whiting2"
                          : "bg-transparent"
                          }`}
                      >
                        <p className="text-sm text-secondary/80 font-medium">
                          {storeHouse.name}
                        </p>
                        {selectedStoreHouse?.storeHouseId === storeHouse.storeHouseId && (
                          <CheckIcon className="size-4 stroke-secondary/80" />
                        )}
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>

              <div className="flex w-full overflow-x-auto [&>div>span]:text-nowrap px-2 gap-2 flex-grow" style={{ scrollbarWidth: 'none' }}>
                <div className="hover:bg-[#f7f7f7] flex flex-col rounded-md px-4 py-2 text-secondary/80 md:text-2xs text-base font-[550] bg-white flex-1 min-w-[200px]">
                  <span className="text-secondary w-fit border-b border-dotted border-gray-300 font-medium md:text-2xs text-base">
                    Total stock en bodega
                  </span>
                  <span className="text-secondary font-medium md:text-2xs text-base">
                    {totalInventory?.totalStock ?? 0} en inventario
                  </span>
                </div>
                <div className="hover:bg-[#f7f7f7] flex flex-col rounded-md px-4 py-2 text-secondary/80 md:text-2xs text-base font-[550] bg-white flex-1 min-w-[200px]">
                  <span className="text-secondary w-fit border-b border-dotted border-gray-300 font-medium md:text-2xs text-base">
                    Total costo promedio
                  </span>
                  <span className="text-secondary font-medium md:text-2xs text-base">
                    {currencyFormatter(totalInventory?.stockAvg ?? 0)}
                  </span>
                </div>
                <div className="hover:bg-[#f7f7f7] flex flex-col rounded-md px-4 py-2 text-secondary/80 md:text-2xs text-base font-[550] bg-white flex-1 min-w-[200px]">
                  <span className="text-secondary w-fit border-b border-dotted border-gray-300 font-medium md:text-2xs text-base">
                    Total inventario monetario
                  </span>
                  <span className="text-secondary font-medium md:text-2xs text-base">
                    {currencyFormatter(totalInventory?.total ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection>
            <>
              <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="min-w-[600px] flex items-center gap-4 md:mb-5 mb-10">
                  {typeReportTotals.map((typeReport, index) => (
                    <div
                      onClick={() => setSelectedType(index)}
                      key={index}
                      className={`px-4 w-56 py-2 cursor-pointer rounded-lg ${selectedType === index ? 'bg-[#f1f1f1]' : ''
                        }`}
                    >
                      <p className="md:text-2xs text-base text-nowrap font-semibold w-fit text-primary border-b-2 border-gray-300 border-dotted">
                        {typeReport.name}
                      </p>
                      <p className="md:text-2xs text-base text-primary font-semibold mt-1">
                        {currencyFormatter(typeReport.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <LineChart
                theme="light"
                isAnimated
                data={lineChartData}
                showLegend
                tooltipOptions={{
                  valueFormatter: (v) => (v != null ? currencyFormatter(v) : ''),
                }}
                xAxisOptions={{
                  labelFormatter: (v) => (v != null ? String(v) : ''),
                }}
                yAxisOptions={{
                  labelFormatter: (v) => (v != null ? `${v} NIO` : ''),
                }}
              />
            </>
          </FormSection>

          <div className='flex md:flex-row flex-col items-center md:space-x-4 md:space-y-0 space-y-4 mt-4'>
            <FormSection className='md:w-1/2 w-full' name='Productos más vendidos' classNameLabel='mb-10'>
              <BarChart
                theme="light"
                isAnimated
                data={productMostSaleData}
                showLegend
                tooltipOptions={{
                  valueFormatter: (v) => (v != null ? currencyFormatter(v) : ''),
                }}
                xAxisOptions={{
                  labelFormatter: (v) => (v != null ? String(v) : ''),
                }}
                yAxisOptions={{
                  labelFormatter: (v) => (v != null ? `${v} NIO` : ''),
                }}
              />
            </FormSection>
            <FormSection className='md:w-1/2 w-full' name='Productos menos vendidos' classNameLabel='mb-10'>
              <BarChart
                theme="light"
                isAnimated
                data={productLessSaleData}
                showLegend
                tooltipOptions={{
                  valueFormatter: (v) => (v != null ? currencyFormatter(v) : ''),
                }}
                xAxisOptions={{
                  labelFormatter: (v) => (v != null ? String(v) : ''),
                }}
                yAxisOptions={{
                  labelFormatter: (v) => (v != null ? `${v} NIO` : ''),
                }}
              />
            </FormSection>
          </div>
        </div>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}
