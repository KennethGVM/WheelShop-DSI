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