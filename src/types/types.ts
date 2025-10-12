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
