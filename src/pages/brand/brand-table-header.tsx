import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import Modal from '@/components/modal';
import { BrandProps } from '@/types/types';
import { Dispatch, SetStateAction, useState } from 'react';
import { supabase } from '@/api/supabase-client';
import { showToast } from '@/components/toast';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface BrandTableHeaderProps {
  brands: BrandProps[];
  setBrands: Dispatch<SetStateAction<BrandProps[]>>;
  selectedBrandIds: BrandProps[];
  selectAll: boolean;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
  setSelectedBrandIds: Dispatch<SetStateAction<BrandProps[]>>;
  setSelectedBrandToEdit: Dispatch<SetStateAction<BrandProps | null>>;
  HEADERS: HeaderProps[];
}

export default function BrandTableHeader({ brands, setBrands, setSelectAll, setSelectedBrandIds, selectedBrandIds, selectAll, HEADERS, setSelectedBrandToEdit }: BrandTableHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = brands.map(brand => brand);
      setSelectedBrandIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedBrandIds([]);
      setSelectAll(false);
    }
  };

const handleUpdateBrandState = async (newState: boolean) => {
  try {
    for (const brand of selectedBrandIds) {
      const isLlantas = brand.category === 'Llantas';
      const tableName = isLlantas ? 'brand' : 'brandOil';
      const idField = isLlantas ? 'brandId' : 'brandOilId';

      const { error } = await supabase
        .from(tableName)
        .update({ state: newState })
        .eq(idField, brand.brandId); // usa el id de la view

      if (error) throw error;
    }

    // Actualizar estado en frontend
    const updatedBrands = brands.map(b =>
      selectedBrandIds.some(sel => sel.brandId === b.brandId)
        ? { ...b, state: newState }
        : b
    );

    setBrands(updatedBrands);
    setIsModalOpen(false);
    showToast(`Marcas ${newState ? 'activadas' : 'desactivadas'} correctamente`, true);
    setSelectedBrandIds([]);
  } catch (error: any) {
    showToast(error.message, false);
  }
};

  const selectedStates = selectedBrandIds.map(b => b.state);
  const allActive = selectedStates.every(state => state === true);
  const allInactive = selectedStates.every(state => state === false);
  const mixedStates = !allActive && !allInactive;

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {brands && brands.length > 0 &&
        <tr className={`${selectedBrandIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th scope="col" className={`w-4 px-2 sticky left-0 ${selectedBrandIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} border-t border-gray-300 z-40`}>
            <CheckBox
              initialValue={selectAll}
              onChange={(value) => handleSelectAll(value)}
            />
            <div className={`absolute text-nowrap left-8 inset-y-2 flex items-center pl-2`}>
              {selectedBrandIds.length > 0 && <span className='text-secondary/80 md:text-xs text-sm font-semibold'>Seleccionados: {selectedBrandIds.length}</span>}
            </div>
          </th>
          {HEADERS.map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={`sm:px-6 px-2 py-2.5 bg-[#F7F7F7] ${className} left-5 ${selectedBrandIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold md:text-xs text-sm ${isNumeric ? "text-right" : "text-left"}`}>
              {title}
            </th>
          ))}

          {selectedBrandIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              <Button name='Editar marca' styleButton="primary" className="px-2 py-1.5 md:text-xs text-sm font-semibold text-secondary/80" onClick={() => setSelectedBrandToEdit(selectedBrandIds[0])} />
              {mixedStates && (
                <>
                  <Button
                    name='Activar marca'
                    styleButton="primary"
                    className="px-2 py-1.5 md:text-xs text-sm font-semibold text-secondary/80"
                    onClick={() => {
                      setModalAction('activate');
                      setIsModalOpen(true);
                    }}
                  />
                  <Button
                    name='Desactivar marca'
                    styleButton="primary"
                    className="px-2 py-1.5 md:text-xs text-sm font-semibold text-secondary/80"
                    onClick={() => {
                      setModalAction('deactivate');
                      setIsModalOpen(true);
                    }}
                  />
                </>
              )}
              {allActive && (
                <Button
                  name='Desactivar marca'
                  styleButton="primary"
                  className="px-2 py-1.5 md:text-xs text-sm font-semibold text-secondary/80"
                  onClick={() => {
                    setModalAction('deactivate');
                    setIsModalOpen(true);
                  }}
                />
              )}
              {allInactive && (
                <Button
                  name='Activar'
                  styleButton="primary"
                  className="px-2 py-1.5 md:text-xs text-sm font-semibold text-secondary/80"
                  onClick={() => {
                    setModalAction('activate');
                    setIsModalOpen(true);
                  }}
                />
              )}
            </div>
          }
        </tr>
      }

      {isModalOpen && (
        <Modal
          name={modalAction === 'activate' ? `¿Establecer ${selectedBrandIds.length} marca(s) como activas?` : `¿Establecer ${selectedBrandIds.length} marca(s) como inactivas?`}
          onClose={() => setIsModalOpen(false)}
          onClickSave={() => handleUpdateBrandState(modalAction === 'activate')}
          principalButtonName={modalAction === 'activate' ? 'Activar' : 'Desactivar'}
        >
          <p className='font-normal py-4 text-secondary/80 text-sm px-4'>
            {modalAction === 'activate'
              ? 'Activar las marcas hará que estén disponibles nuevamente en todos los procesos del sistema.'
              : 'Desactivar las marcas las ocultará de todos los procesos del sistema.'}
          </p>
        </Modal>
      )}
    </thead>
  );
}
