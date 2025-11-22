export interface GeneralProps {
  generalId: string;
  dolarValue: number;
  companyName: string;
  companyAddress: string;
  ruc: string;
  phone: string;
}

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

export interface DepartmetProps {
  departmentId: string;
  departmentName: string;
}

export interface MunicipalityProps {
  municipalityId: string;
  municipalityName: string;
  departmentId: string;
}
export interface BrandProps {
  brandId: string;
  brandName: string;
  createdAt: Date;
  state: boolean;
  category: string;
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

export type ProductFilter = "Llantas" | "Aceites" | "Productos Varios";


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

export interface BrandOilProps {
  brandOilId: string;
  brandOilName: string;
  createdAt: Date;
}

export interface productCategoryProps {
  productCategoryId: string;
  productCategoryName: string;
  state: boolean;
  createdAt: Date;
}

export interface TypeVehicleProps {
  typeVehicleId: string;
  nameTypeVehicle: string;
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
  //return: ReturnProps[];
  productCount?: number;
  dollarChange: number;
  pays?: number | null;
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

export interface newProduct {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
  subTotal: number;
  total: number;
}
