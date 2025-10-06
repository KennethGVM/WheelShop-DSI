import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase-client';
import { GeneralProps } from '@/types/types';
import { showToast } from '@/components/toast';

type GeneralInformationContextType = {
  dollarValue: number | null;
  generalId: string;
  companyName: string;
  companyAddress: string;
  companyRuc: string;
  companyPhone: string;
  setCompanyName: (value: string) => void;
  setCompanyAddress: (value: string) => void;
  setCompanyRuc: (value: string) => void;
  setCompanyPhone: (value: string) => void;
  setDollarValue: (value: number) => void;
};

const GeneralInformationContext = createContext<GeneralInformationContextType | undefined>(undefined);

export const useGeneralInformation = () => {
  const context = useContext(GeneralInformationContext);
  if (!context) {
    throw new Error('useGeneralInformation must be used within a GeneralInformationProvider');
  }
  return context;
};

type ProviderProps = {
  children: ReactNode;
};

export const GeneralInformationProvider = ({ children }: ProviderProps) => {
  const [dollarValue, setDollarValue] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [companyAddress, setCompanyAddress] = useState<string>('');
  const [companyRuc, setCompanyRuc] = useState<string>('');
  const [companyPhone, setCompanyPhone] = useState<string>('');
  const [generalId, setGeneralId] = useState<string>('');

  useEffect(() => {
    const handleLoadGeneralInformation = async () => {
      const { data, error } = await supabase.from('general').select('*');
      const generalData = data as GeneralProps[];

      if (generalData && generalData[0]) {
        setDollarValue(generalData[0].dolarValue);
        setCompanyName(generalData[0].companyName);
        setCompanyAddress(generalData[0].companyAddress);
        setCompanyRuc(generalData[0].ruc);
        setCompanyPhone(generalData[0].phone);
        setGeneralId(generalData[0].generalId);
      }

      if (error) {
        showToast(error.message, false);
      }
    };

    handleLoadGeneralInformation();
  }, []);

  return (
    <GeneralInformationContext.Provider
      value={{
        dollarValue,
        setDollarValue,
        setCompanyAddress,
        setCompanyName,
        setCompanyPhone,
        setCompanyRuc,
        companyName,
        companyAddress,
        generalId,
        companyRuc,
        companyPhone
      }}
    >
      {children}
    </GeneralInformationContext.Provider>
  );
};
