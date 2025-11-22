import { useRolePermission } from "@/api/permissions-provider";
import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
import { ArrowDownIcon } from "@/icons/icons";
import { getPermissions } from "@/lib/function";
import { InventoryProps, ProductAdjustmentProps, TypeAdjustmentProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type SelectedItem = {
  inventoryId: string
  supplierIds: string[]
}

interface InventoryTableRowProps {
  inventory: InventoryProps;
  selectedInventoryIds: SelectedItem[];
  setSelectedInventoryIds: Dispatch<SetStateAction<SelectedItem[]>>;
  productAdjustments: ProductAdjustmentProps[];
  setProductAdjustments: Dispatch<SetStateAction<ProductAdjustmentProps[]>>;
  typeAdjustments: TypeAdjustmentProps[];
}

export default function InventoryTableRow({
  inventory,
  selectedInventoryIds,
  setSelectedInventoryIds,
  productAdjustments,
  setProductAdjustments,
  typeAdjustments
}: InventoryTableRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;

  useEffect(() => {
    if (dropdownOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [dropdownOpen]);

  const getSelection = (productId: string) => {
    return selectedInventoryIds.find((item) => item.inventoryId === productId)
  }

  const isSupplierSelected = (productId: string, supplierId: string) => {
    const item = getSelection(productId)
    return item ? item.supplierIds.includes(supplierId) : false
  }

  const areAllSuppliersSelected = (product: InventoryProps) => {
    const item = getSelection(product.productId)
    return item && item.supplierIds.length === product.suppliers.length
  }

  const handleSelectSupplier = (productId: string, supplierId: string, checked: boolean) => {
    setSelectedInventoryIds((prev) => {
      const existing = prev.find((item) => item.inventoryId === productId)
      if (checked) {
        if (existing) {
          if (!existing.supplierIds.includes(supplierId)) {
            existing.supplierIds.push(supplierId)
          }
          return [...prev]
        } else {
          return [...prev, { inventoryId: productId, supplierIds: [supplierId] }]
        }
      } else {
        if (existing) {
          const updated = existing.supplierIds.filter((id) => id !== supplierId)
          if (updated.length > 0) {
            return prev.map((item) =>
              item.inventoryId === productId ? { ...item, supplierIds: updated } : item
            )
          } else {
            return prev.filter((item) => item.inventoryId !== productId)
          }
        }
        return prev
      }
    })
  }

  const handleSelectProduct = (product: InventoryProps, checked: boolean) => {
    setSelectedInventoryIds((prev) => {
      if (checked) {
        const supplierIds = product.suppliers.map((s) => s.supplierId)
        const existing = prev.find((item) => item.inventoryId === product.productId)
        if (existing) {
          return prev.map((item) =>
            item.inventoryId === product.productId ? { ...item, supplierIds } : item
          )
        } else {
          return [...prev, { inventoryId: product.productId, supplierIds }]
        }
      } else {
        return prev.filter((item) => item.inventoryId !== product.productId)
      }
    })
  }

  const handleAdjustmentChange = (productSupplierId: string, quantity: number, reason: string, cost: number) => {
    setProductAdjustments((prevAdjustments) => {
      const existingAdjustment = prevAdjustments.find(adjustment => adjustment.productSupplierId === productSupplierId);

      if (existingAdjustment) {
        return prevAdjustments.map(adjustment =>
          adjustment.productSupplierId === productSupplierId
            ? { ...adjustment, quantity, reason, cost }
            : adjustment
        );
      } else {
        return [...prevAdjustments, {
          productSupplierId,
          quantity,
          reason: reason || typeAdjustments[0]?.typeAdjusmentId || '',
          cost
        }];
      }
    });
  };

  return (
    <>
      <tr
        key={inventory.inventoryId}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`${isExpanded ? 'bg-whiting2' : 'bg-white'} group cursor-pointer text-2xs font-medium border-b text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
      >
        <td className="w-4 pl-2 py-4">
          <CheckBox
            initialValue={areAllSuppliersSelected(inventory)}
            onChange={(checked) => handleSelectProduct(inventory, !!checked)}
          />
        </td>
        <td className="px-2 py-4 w-[30%]">{inventory.productName}</td>
        <td className="px-2 py-4">{inventory.numeration ? inventory.numeration : 'Ninguna'}</td>
        <td className={`px-2 py-4 w-56 ${inventory.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0) < 10 ? 'text-red-900' : ''}`}>
          {inventory.suppliers.reduce((acc, supplier) => {
            const adjustment = productAdjustments.find(
              (adj) => adj.productSupplierId === supplier.productSupplierId
            );

            return acc + (adjustment?.quantity ?? supplier.stock);
          }, 0)} en stock
        </td>
        <td className="px-9 py-4 text-right">
          {inventory.suppliers.reduce((acc, supplier) => acc + supplier.purchaseOrders.reduce((acc, purchaseOrder) => acc + purchaseOrder.quantity, 0), 0)}
        </td>
        <td className="px-2 py-4 text-right">
          {
            Number(inventory.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0)) +
            inventory.suppliers.reduce((acc, supplier) => acc + supplier.purchaseOrders.reduce((acc, purchaseOrder) => acc + purchaseOrder.quantity, 0), 0)
          }
        </td>
        <td className="px-2 py-4">
          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}
        </td>
      </tr>

      {isExpanded && inventory.suppliers.map(({ supplierId, nameSupplier, lastUpdate, stock, purchaseOrders, productSupplierId, cost }, key) => {
        const currentAdjustment = productAdjustments.find(
          (adjustment) => adjustment.productSupplierId === productSupplierId
        );

        return (
          <tr key={key} className="bg-white group cursor-pointer text-2xs font-medium border-b text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]">
            <td className="w-4 px-2 " />

            <td className="px-2  w-[30%]">
              <div className="flex items-center space-x-3">
                <CheckBox
                  initialValue={isSupplierSelected(inventory.productId, supplierId)}
                  onChange={(checked) =>
                    handleSelectSupplier(inventory.productId, supplierId, !!checked)
                  }
                />
                {nameSupplier}
              </div>
            </td>
            <td className="px-2 ">{inventory.numeration}</td>
            <td className="px-2  w-56">
              <div className="flex items-center w-fit pr-2 py-1 space-x-2 hover:bg-[#f2f2f2] rounded-lg">
                <FieldInput
                  value={currentAdjustment?.quantity ?? stock}
                  className="mb-0 w-32"
                  readOnly
                />
                {getPermissions(permissions, "Inventario", "Gestionar ajustes de inventario")?.canAccess &&
                  <Dropdown onOpenChange={setDropdownOpen}>
                    <DropdownTrigger>
                      <Button>
                        <ArrowDownIcon className="size-4 stroke-none fill-secondary/80 invisible group-hover:visible" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownContent className="w-60 rounded-xl mt-3" align="end">
                      <div className="px-3">
                        <FieldInput
                          name="Ajustar por"
                          isNumber
                          className="mb-1 w-2/3"
                          value={currentAdjustment?.quantity ?? 0}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            const parsedValue = parseFloat(newValue);

                            if (newValue === "" || parsedValue === 0) {
                              setProductAdjustments((prevAdjustments) =>
                                prevAdjustments.filter(adjustment => adjustment.productSupplierId !== productSupplierId)
                              );
                            } else if (!isNaN(parsedValue)) {
                              handleAdjustmentChange(productSupplierId, parsedValue, currentAdjustment?.reason ?? '', cost);
                            }
                          }}
                          ref={inputRef}
                        />

                        {(currentAdjustment?.quantity !== 0 || currentAdjustment?.quantity !== undefined) && <p className="text-secondary/80 text-2xs font-medium">(Cantidad original: {stock})</p>}

                        <FieldSelect
                          name="Razón"
                          className="mt-4"
                          options={typeAdjustments.map((typeAdjustment) => ({ name: typeAdjustment.name, value: typeAdjustment.typeAdjusmentId }))}
                          value={currentAdjustment?.reason}
                          onChange={(e) => handleAdjustmentChange(productSupplierId, currentAdjustment?.quantity ?? 0, e.target.value, cost)}
                        />
                      </div>
                    </DropdownContent>
                  </Dropdown>
                }
              </div>
            </td>
            <td className="px-2 ">
              <div className="flex justify-end">
                <Dropdown>
                  <DropdownTrigger>
                    <button className="flex items-center px-2 py-1 hover:bg-[#f2f2f2] rounded-lg space-x-1">
                      <span>
                        {purchaseOrders.reduce((acc, purchaseOrder) => acc + purchaseOrder.quantity, 0)}
                      </span>
                      <ArrowDownIcon className="size-4 invisible group-hover:visible stroke-none fill-secondary/80" />
                    </button>
                  </DropdownTrigger>
                  {getPermissions(permissions, "Ordenes de compras", "Ver")?.canAccess &&
                    <DropdownContent align="end" className="rounded-2xl">
                      <span className="font-semibold text-2xs text-secondary inline-block mx-4 mb-2">Órdenes de compra</span>
                      {purchaseOrders.length > 0 ? (
                        purchaseOrders.map(({ purchaseOrderId, codePurchaseOrder, quantity }, index) => (
                          <div key={index}>
                            <DropdownItem className={`justify-between ${index !== purchaseOrders.length - 1 ? 'py-0' : ''} cursor-default w-[250px] hover:bg-transparent`}>
                              <a href={`/purchases/receive/${purchaseOrderId}`} className="text-blueprimary underline hover:text-bluesecondary">{codePurchaseOrder}</a>
                              <span>{quantity}</span>
                            </DropdownItem>
                            {index !== purchaseOrders.length - 1 && <DropdownSeparator />}
                          </div>
                        ))
                      ) : (
                        <DropdownItem className="hover:bg-transparent">
                          {getPermissions(permissions, "Ordenes de compras", "Editar ordenes de compra")?.canAccess ? (
                            <div className="flex items-center space-x-3">
                              <span>Crear <a href={`purchases/add?productId=${inventory.productId}`} className="text-blueprimary hover:underline hover:text-bluesecondary">orden de compra</a></span>
                            </div>
                          ) : (
                            <span>Permiso denegado</span>
                          )}
                        </DropdownItem>
                      )}
                    </DropdownContent>
                  }
                </Dropdown>
              </div>
            </td>
            <td className="px-2  text-right">{purchaseOrders.reduce((acc, purchaseOrder) => acc + purchaseOrder.quantity, 0) + stock}</td>
            <td className="px-2 ">{lastUpdate ? new Date(lastUpdate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}</td>
          </tr>
        );
      })}

    </>
  );
}
