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
