
export interface SelectedSupplierProps {
  supplierId: string;
  state: boolean
}

export interface SupplierProps {
  supplierId: string;
  ruc: string;
  nameSupplier: string;
  socialReason: string;
  phone: string;
  email: string;
  state: boolean;
  createdAt: Date;
}

export interface BrandProps {
  brandId: string;
  brandName: string;
  createdAt: Date;
  state: boolean;
  category: string;
}

export interface BrandOilProps {
  brandOilId: string;
  brandOilName: string;
  createdAt: Date;
}

export interface TypeVehicleProps {
  typeVehicleId: string;
  nameTypeVehicle: string;
  createdAt: Date;
}

export interface RinProps {
  rinId: string;
  typeVehicleId: string;
  nameRin: string;
  createdAt: Date;
}

export interface ProductSupplierProps {
  supplierId: string;
  productSupplierId: string;
  price: number;
  cost: number;
  minPrice: number;
  suggestedPrice: number;
  supplierName?: string;
}

export interface ProductProps {
  productId: string;
  brandName: string;
  description: string;
  name: string;
  brandId: string;
  typeVehicleId: string;
  nameTypeVehicle: string;
  nameRin: string;
  numeration: string;
  state: boolean;
  suppliers: ProductSupplierProps[];
  createdAt?: Date;
  productCategoryId: string;
  productCategoryName: string;
  brandOilId: string;
  isDiesel: boolean;
  numerationOil: string;
  brandOilName: string;
  storeHouseId: string;
  storeHouseName: string;
  storeHouseInventory: {
    stock: number;
    storeHouse: string;
  }[]
}

export interface CustomerProps {
  customerId: string;
  customerName: string;
  customerLastName: string;
  dni: string;
  email: string;
  phone: string;
  state: boolean;
  categoryCustomerId: string;
  createdAt: Date;
  categoryCustomerName: string;
  address: string;
  departmentId: string;
  municipalityId: string;
  municipalityName: string;
  departmentName: string;

}

export interface CategoryCustomerProps {
  categoryCustomerId: string;
  categoryCustomerName: string;
  state: boolean;
  createdAt: Date;
}

export interface PaymentMethodProps {
  paymentMethodId: string;
  namePaymentMethod: string;
  createdAt: Date;
}

export interface BankProps {
  bankId: string;
  bankName: string;
  createdAt: Date;
}

export interface ProductAdjustmentProps {
  productSupplierId: string;
  quantity: number;
  cost: number;
  reason: string;
}

export interface SelectedProducts {
  productId: string;
  productSupplierId: string;
  name: string;
  quantity: number;
  subTotal?: number;
  discount?: number;
  stock?: number;
  cost?: number | string;
  price?: number | string;
  storeHouseId?: string;
  storeHouseName?: string;
  supplierId?: string;
  nameSupplier?: string;
  reason?: string;
}

export interface productCategoryProps {
  productCategoryId: string;
  productCategoryName: string;
  state: boolean;
  createdAt: Date;
}

export interface StoreHouseProps {
  storeHouseId: string;
  name: string;
  numberStoreHouse: number | string;
  suppliers: string[];
  state: boolean;
}

export interface PurchaseProductProps {
  productSupplierId: string;
  productName: string;
  quantity: number;
  cost: number;
  total: number;
}

export interface PaymentConditionProps {
  paymentConditionId: string;
  name: string;
  createdAt: Date;
}

export interface PurchaseProps {
  purchaseOrderId: string;
  codePurchaseOrder: string;
  supplierId: string;
  storeHouseId: string;
  paymentMethodId: string;
  currencyId: string;
  currencyName: string;
  shippingCost: number;
  arrivalDate: Date | null;
  referenceNumber: string;
  observations: string;
  subTotal: number;
  discount: number;
  total: number;
  state: number;
  createdAt: Date;
  namePaymentMethod: string;
  nameSupplier: string;
  namestorehouse: string;
  expirationDate: Date | null;
  paymentConditionId: string | null;
  purchaseType: number;
  products: PurchaseProductProps[];
}

export interface PurchaseDeferredPaymentProps {
  purchaseDeferredPaymentId: string;
  purchaseOrderId: string;
  paymentCode: string;
  paymentMethodId: string;
  currencyId: string;
  amount: number;
  state: boolean;
  balance: number;
  createdAt: Date;
  dollarChange: number | null;
}

export interface OpeningDetailProps {
  cashBoxOpeningDetailsId: string;
  denominationId: string;
  denominationName: string;
  quantity: number;
  total: number;
  createdAt: string;
  currencyName: string;
}

export interface OpeningProps {
  cashBoxOpeningId: string;
  openingDate: string;
  cashBoxId: string;
  userId: string;
  cashBoxName: string;
  email: string;
  total: string;
  observations: string;
  status: boolean;
  details: OpeningDetailProps[];
}


export interface DiscountProps {
  discountId: string;
  title: string;
  amount: number;
  typeRequirement: number;
  minimumPurchase: number | null;
  minimumProduct: number | null;
  startDate: Date;
  endDate: Date | null;
  isOnce: boolean;
  state: boolean;
  createdAt: Date;
  products: { productId: string; name: string }[];
  isPercentage: boolean;
  typeDiscount: number;
  quantity: number;
  secondProducts: string[];
  isFree: boolean;
  uses: number;
}

export interface CashBoxProps {
  cashBoxId: string;
  name: string;
  createdAt: Date;
  state: boolean;
  isOpen: boolean;
}

export type ProductFilter = "Llantas" | "Aceites" | "Productos Varios";
export type SaleFilter = "Credito" | "Anuladas" | "Ventas";
export type QuotationFilter = "Completadas" | "Pendientes";
export type PendingAccountFilter = "Todos" | "Vencido";



export interface PurchaseReceiptQuantityProductProps {
  productId: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  cost: number;
  costProduct: number;
}

export interface PurchaseOrderReceiptProps {
  purchaseOrderId: string;
  supplierId: string;
  storeHouseId: string;
  currencyId: string;
  currencyName: string;
  paymentConditionName: string;
  paymentMethodId: string;
  arrivalDate: Date | null;
  createdAt: Date;
  referenceNumber: string;
  observations: string;
  shippingCost: number;
  subTotal: number;
  discount: number;
  total: number;
  products: PurchaseReceiptQuantityProductProps[];
  state: number;
  codePurchaseOrder: string;
  expirationDate: Date | null;
  paymentConditionId: string | null;
  purchaseType: number;
}

export interface ProductItem {
  productId: string;
  name: string;
  stock: number;
  total: number;
}

export interface StoreHouseWithProducts {
  storeHouseName: string;
  products: ProductItem[];
}


export interface ReportProps {
  name: string;
  category: string;
}

export interface SalesReportProps {
  saleDay: string;
  totalSalesAmount: number;
  totalSalesCount: number;
}

export interface PurchasesReportProps {
  purchaseDay: string;
  totalPurchaseAmount: number;
  totalPurchaseCount: number;
}

export interface ProductReportProps {
  name: string;
  totalQuantitySold: number,
  totalAmountSold: number
}

export interface TotalInventoryProps {
  totalStock: number;
  stockAvg: number;
  total: number;
}

export interface TransferReportProps {
  codeTransfer: string;
  origin: string;
  destination: string;
  totalQuantityTransferred: number;
}

export interface RealSaleReportProps {
  saleId: string;
  salesCode: string;
  typeSale: number;
  total: number;
  createdAt: string;
  realTotal: number;
  percentagePaid: number;
}

export interface InventoryReportProps {
  inventoryId: string;
  productName: string;
  totalQuantity: number;
}

export interface AdjustmentHistoryProps {
  inventoryMovementsId: string;
  productSupplierId: string;
  typeMovement: number;
  typeMovementName: 'Compra' | 'Ajuste de Inventario' | 'Transferencia de inventario (salida)' | 'Transferencia de inventario (entrada)' | 'Venta' | 'Devolución' | 'Cambio';
  quantity: number;
  cost: string;
  total: string;
  createdAt: string;
  referenceId: string;
  details: {
    saleId: string;
    salesCode: string;
    purchaseOrderId: string;
    codePurchaseOrder: string;
    inventoryAdjustmentId: string;
    reason: string;
    transferId: string;
    codeTransfer: string;
  }
}

export interface TransferProps {
  transferId: string;
  userId: string;
  email: string;
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  referenceNumber: string;
  observations: string;
  state: boolean;
  createdAt: Date;
  codeTransfer: string;
  products: TransferDetailsProps[];
}

export interface TransferDetailsProps {
  productSupplierId: string;
  productName: string;
  quantity: number;
  nameSupplier: string;
}

interface InventorySupplier {
  productSupplierId: string;
  supplierId: string;
  nameSupplier: string;
  stock: number;
  lastUpdate: string | null;
  createdAt: string | null;
  storeHouseId: string | null;
  storeHouseName: string | null;
  cost: number;
  purchaseOrders: {
    purchaseOrderId: string;
    codePurchaseOrder: string;
    quantity: number;
  }[];
}

export interface InventoryProps {
  inventoryId: string;
  productId: string;
  productName: string;
  numeration: string;
  productType: string;
  suppliers: InventorySupplier[];
}

export interface GeneralProps {
  generalId: string;
  dolarValue: number;
  companyName: string;
  companyAddress: string;
  ruc: string;
  phone: string;
}

export interface TypeAdjustmentProps {
  typeAdjusmentId: string;
  name: string;
}

export interface DepartmetProps {
  departmentId: string;
  departmentName: string;
}


export interface MunicipalityProps {
  municipalityId: string;
  municipalityName: string;
  departmentId: string;
}

export interface UserPermissionProps {
  userId: string;
  roleId: string;
  roleName: string;
  email: string;
  lastSignInAt: Date;
  createdAt: Date;
  updateAt: Date;
  phone: string;
  state: boolean;
}

export interface LoginHistoryProps {
  loginHistoryId: string;
  userId: string;
  ip: string;
  os: string;
  isp: string;
  location: string;
  browser: string;
  loginDate: Date;
}

export interface CurrencyProps {
  currencyId: string;
  currencyName: string;
}

export interface SaleProductProps {
  productSupplierId: string;
  productId: string;
  productName: string;
  quantity: number;
  productPrice: number;
  productDiscount: number;
  total: number;
  subTotal: number;
  storeHouseId: string;
  storeHouseName: string;
  supplierId: string;
  nameSupplier: string;
  reason: string;

}

interface SaleProductSupplier extends ProductSupplierProps {
  stock: number;
  storeHouseId: string;
  storeHouseName: string;
  nameSupplier?: string;
}

export interface ProductModalSaleProps {
  productId: string;
  productName: string;
  suppliers: SaleProductSupplier[];
  category: productCategoryProps;
  brandName: string;
  nameRin: string;
  nameTypeVehicle: string;
  numeration: string;
  brandOilName: string;
  numerationOil: string;
}

export interface ArchingTicketDetail {
  archingTicketDetailsId: string;
  denominationId: string;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface ArchingBankDetail {
  archingBankDetailsId: string;
  bankId: string;
  currencyId: string;
  total: number;
  createdAt: string;
}

export interface ArchingTransferDetail {
  archingTransferDetailsId: string;
  bankId: string;
  currencyId: string;
  total: number;
  createdAt: string;
}

export interface ArchingProps {
  archingId: string;
  cashBoxId: string;
  cashBoxName: string;
  userId: string;
  email: string;
  total: string;
  systemTotal: number;
  diference: string;
  observations: string;
  justification: string;
  archingDate: string;
  state: boolean;
  dollarChange: number;
  totalTransfer: number;
  totalBank: number;
  totalTicket: number;
  tickets: ArchingTicketDetail[];
  banks: ArchingBankDetail[] | null;
  transfers: ArchingTransferDetail[] | null;
  beginningBalance: number;
  expense: number;
  income: number;
}

export interface DenominationProps {
  denominationId: string;
  name: string;
  currencyId: string;
  amount: number;
  isCoin: boolean;
  currencyName: string;
  createdAt: Date;
}

export interface SaleProps {
  saleId: string;
  salesCode: string;
  userId: string;
  user?: string | null;
  customerId: string;
  customerName: string;
  customerLastName?: string;
  phone?: string;
  email?: string;
  dni?: string;
  discount: number;
  shippingCost: number;
  subTotal: number;
  total: number;
  observation: string;
  typeSale: number | null;
  expirationDate: Date | null;
  userIdCancellation: string | null;
  cancellationUser?: string | null;
  cancellationReason: string;
  cancellationDate: Date | null;
  state: number | boolean;
  stateQuotation?: boolean | null;
  createdAt: Date;
  products: SaleProductProps[];
  salePaymentDetails: salePaymentDetailProps[];
  return: ReturnProps[];
  productCount?: number;
  dollarChange: number;
  pays?: number | null;
}

export interface RoleProps {
  roleId: string;
  name: string;
  description: string;
  createdAt: Date;
  users?: number;
  state: boolean;
}

export type RolePermissionProps = {
  rolePermissionId: string;
  roleId: string;
  permissions: PermissionProps[];
  createdAt: Date;
};

export type PermissionProps = {
  moduleName: string;
  canAccess: boolean;
  subModules: SubModuleProps[] | null;
};

export type SubModuleProps = {
  subModuleName: string;
  canAccess: boolean;
  subSubModules: SubSubModuleProps[] | null;
};

export type SubSubModuleProps = {
  subSubModuleName: string;
  canAccess: boolean;
};

export interface salePaymentDetailProps {
  salePaymentDetailId: string;
  saleId?: string;
  paymentMethodId: string;
  namePaymentMethod?: string;
  amount: number;
  currencyId: string;
  currencyName?: string;
  reference: string;
  bankId: string | null;
  bankName?: string;
}


export interface QuotationProps {
  quotationId: string;
  quotationCode: string;
  userId: string;
  user?: string | null;
  customerId: string;
  customerName: string;
  customerLastName?: string;
  phone: string;
  email: string;
  dni: string;
  discount: number;
  shippingCost: number;
  subTotal: number;
  total: number;
  observation: string;
  state: boolean;
  createdAt: Date;
  products: QuotationProductProps[];
  newProducts?: newProduct[];
  productCount?: number;
}

export interface QuotationProductProps {
  productSupplierId: string;
  productId: string;
  productName: string;
  quantity: number;
  productPrice: number;
  productDiscount: number;
  total: number;
  subTotal: number;
  storeHouseId: string;
  storeHouseName: string;
  supplierId: string;
  nameSupplier: string;
}

export interface ReturnProps {
  returnId: string;
  subTotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  userId: string;
  returnUser?: string | null | undefined;
  createdAt: Date;
  returnDetail: RetunDetailProps[];
  returnPaymentDetail: ReturnPaymentDetailProps[];
  dollarChange: number;
}

export interface RetunDetailProps {
  returnDetailId: string;
  returnId: string;
  productSupplierId: string;
  productName?: string;
  productPrice: number;
  quantity: number;
  subTotal: number;
  discount: number;
  total: number;
  reason: string;
  type: boolean;
  storeHouseId: string;
  storeHouseName: string;
  supplierId: string;
  supplierName: string;
  createdAt: Date;
}

export interface ReturnPaymentDetailProps {
  returnPaymentDetailId: string;
  returnId?: string;
  amount: number;
  reference: string;
  bankId: string | null;
  currencyId: string;
  currencyName?: string;
  paymentMethodId: string;
  namePaymentMethod?: string;
  bankName?: string | null;
  createdAt: Date;
}

export interface newProduct {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
  subTotal: number;
  total: number;
}

export interface SaleDeferredPaymentProps {
  saleDeferredPaymentId: string;
  saleId: string;
  paymentCode: string;
  paymentMethodId: string;
  currencyId: string;
  bankId: string | null;
  amount: number;
  state: boolean;
  balance: number;
  createdAt: Date;
  dollarChange: number | null;
}

export interface PendingAccountProps {
  saleId: string;
  salesCode: string;
  customerName: string;
  createdAt: Date;
  expirationDate: Date | null;
  daysPending: number;
  total: number;
  saldo: number;
}

export interface ExpenseProps {
  expenseId: string;
  userId: string;
  userName: string;
  name: string;
  description: string;
  isCommission: boolean;
  amount: number;
  currencyId: string;
  currencyName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  createdAt: Date;
  dollarChange: number;
}


export interface ClosingTicketDetail {
  closingTicketDetailsId: string;
  denominationId: string;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface ClosingBankDetail {
  closingBankDetailsId: string;
  bankId: string;
  currencyId: string;
  total: number;
  createdAt: string;
}

export interface ClosingTransferDetail {
  closingTransferDetailsId: string;
  bankId: string;
  currencyId: string;
  total: number;
  createdAt: string;
}

export interface ClosingProps {
  closingId: string;
  cashBoxId: string;
  cashBoxName: string;
  userId: string;
  email: string;
  total: string;
  systemTotal: number;
  diference: string;
  observations: string;
  justification: string;
  closingDate: string;
  state: boolean;
  dollarChange: number;
  totalTransfer: number;
  totalBank: number;
  totalTicket: number;
  tickets: ClosingTicketDetail[];
  banks: ClosingBankDetail[] | null;
  transfers: ClosingTransferDetail[] | null;
  beginningBalance: number;
  expense: number;
  income: number;
}