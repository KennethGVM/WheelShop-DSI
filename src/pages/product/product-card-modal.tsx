import CheckBox from '@/components/form/check-box';
import StatusTags from '@/components/status-tags';
import { InformationCircleIcon } from '@/icons/icons';
import { ProductProps, SelectedProducts } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';

interface ProductCardModalProps {
  products: ProductProps[];
  activeProducts: SelectedProducts[];
  selectedProducts: SelectedProducts[];
  setSelectedProducts: Dispatch<SetStateAction<SelectedProducts[]>>;
  supplierId: string;
}

export default function ProductCardModal({ setSelectedProducts, supplierId, activeProducts, products, selectedProducts }: ProductCardModalProps) {
  const toggleProductSelection = (product: SelectedProducts) => {
    setSelectedProducts((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.productId === product.productId);
      return isAlreadySelected
        ? prevSelected.filter((p) => p.productId !== product.productId)
        : [...prevSelected, product];
    });
  };

  return (
    <>
      <div className="hidden md:grid md:grid-cols-3 p-4 border-y border-gray-300 [&>span]:text-primary [&>span]:font-medium [&>span]:text-sm">
        <span className="md:col-span-2">Productos</span>
        <span className="text-center">Total disponible</span>
      </div>

      <div style={{ scrollbarWidth: "none" }} className="overflow-y-auto max-h-[500px]">
        {products.map((product, index) => {
          const isSelected = selectedProducts.some((p) => p.productId === product.productId);
          const isActive = activeProducts.some((p) => p.productId === product.productId);
          const isFaded = isActive;
          const totalStock = product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0);

          return (
            <button
              key={index}
              type='button'
              disabled={isFaded}
              onClick={() => {
                const matchedSupplier = product.suppliers.find(s => s.supplierId === supplierId);
                const productSupplierId = matchedSupplier?.productSupplierId ?? '';
                const cost = matchedSupplier?.cost ?? 0;
                toggleProductSelection({
                  name: product.name,
                  productId: product.productId,
                  cost: cost,
                  price: 0,
                  quantity: 1,
                  storeHouseId: product.storeHouseId,
                  storeHouseName: product.storeHouseName,
                  productSupplierId,
                });
              }}
              className={`grid grid-cols-1 md:grid-cols-3 md:items-center w-full hover:bg-[#f7f7f7] cursor-pointer px-4
                ${index !== products.length - 1 ? "border-b border-gray-300" : "border-0"}
                ${isSelected ? "bg-[#f7f7f7]" : ""}
                ${isFaded ? 'py-2' : 'py-4'}`}
            >
              <div className="md:col-span-2 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckBox
                    onChange={() => {
                      const matchedSupplier = product.suppliers.find(s => s.supplierId === supplierId);
                      const productSupplierId = matchedSupplier?.productSupplierId ?? '';
                      toggleProductSelection({
                        name: product.name,
                        productId: product.productId,
                        cost: 0,
                        price: 0,
                        quantity: 1,
                        storeHouseId: product.storeHouseId,
                        storeHouseName: product.storeHouseName,
                        productSupplierId,
                      });
                    }}
                    className={isFaded ? "opacity-40" : "opacity-100"} initialValue={isSelected} />
                  <div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-medium md:text-2xs text-base text-secondary/90 ${isFaded ? "opacity-40" : "opacity-100"} truncate max-w-[200px] block`}
                      >
                        {product.name}
                      </span>

                      <StatusTags text="Activo" status />
                    </div>

                    {isFaded && (
                      <div className="flex items-center space-x-1 mt-0.5">
                        <InformationCircleIcon className="md:size-4 size-5 fill-[#4F4700]" />
                        <span className="font-[550] md:text-2xs text-base text-[#4F4700]">Artículo ya seleccionado</span>
                      </div>
                    )}
                  </div>
                </div>

                <span className={`font-medium md:text-2xs text-base text-secondary/90 ${isFaded ? "opacity-40" : "opacity-100"} md:hidden`}>
                  {totalStock} en stock
                </span>
              </div>

              <span className="hidden md:flex items-center font-medium text-2xs text-secondary/90 justify-center">
                {totalStock}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
