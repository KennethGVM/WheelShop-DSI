/* eslint-disable react-hooks/exhaustive-deps */
import { useRolePermission } from "@/api/permissions-provider";
import { supabase } from "@/api/supabase-client";
import Button from "@/components/form/button";
import FieldInput from "@/components/form/field-input";
import ProgressBar from "@/components/form/progress-bar";
import Modal from "@/components/modal";
import SubHeader from "@/components/sub-header";
import { showToast } from "@/components/toast";
import Container from "@/layout/container";
import FormSection from "@/layout/form-section";
import { getPermissions } from "@/lib/function";
import { PurchaseOrderReceiptProps } from "@/types/types";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccessPage from "../access-page";

export default function PurchaseReceiveInventory() {
  const INITIAL_PRODUCTS: PurchaseOrderReceiptProps = {
    purchaseOrderId: '',
    supplierId: '',
    storeHouseId: '',
    paymentMethodId: '',
    arrivalDate: null,
    createdAt: new Date(),
    referenceNumber: '',
    observations: '',
    shippingCost: 0,
    subTotal: 0,
    total: 0,
    products: [],
    state: 0,
    codePurchaseOrder: '',
    expirationDate: null,
    paymentConditionId: null,
    purchaseType: 0,
    currencyId: '',
    currencyName: '',
    paymentConditionName: '',
    discount: 0,
  }
  const { purchaseId } = useParams();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<'accept' | 'reject'>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<PurchaseOrderReceiptProps>(INITIAL_PRODUCTS);
  const [productStatus, setProductStatus] = useState<{ productId: string; accepted: number; rejected: number }[]>([]);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canReceiveInventory = getPermissions(permissions, "Ordenes de compras", "Recibir inventario")?.canAccess;
  const HEADER = [
    { label: "Productos", className: "px-4 py-5 w-[30%]" },
    { label: "Aceptar", className: "px-2 py-5" },
    { label: "Rechazar", className: "px-2 py-5" },
    { label: "Recibido", className: "px-6 py-5" },
  ];

  useEffect(() => {
    const handleLoadPurchaseById = async () => {
      const { data } = await supabase
        .from('getpurchasereceipt')
        .select('*')
        .eq('purchaseOrderId', purchaseId);
      const purchaseDate = data?.[0] as unknown as PurchaseOrderReceiptProps;
      setFormData(purchaseDate)
      setProductStatus(
        purchaseDate.products.map((product) => ({
          productId: product.productId,
          accepted: product.receivedQuantity,
          rejected: Math.max(0, product.orderedQuantity - product.receivedQuantity)
        }))
      );
    };

    if (purchaseId) {
      handleLoadPurchaseById();
    }
  }, [purchaseId]);

  const handleInputChange = (productId: string, type: 'accepted' | 'rejected', value: number) => {
    setProductStatus((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, [type]: value } : item
      )
    );
  };

  const handleChangeOption = (option: 'accept' | 'reject') => {
    setSelectedOption(option);
    setIsShowModal(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    const { data, error } = await supabase.from('purchaseReceipt').insert({
      purchaseOrderId: purchaseId,
    }).select();

    if (error) {
      showToast(error.message, false);
    } else {
      handleSavePurchaseReceiptDetail(data[0].purchaseReceiptId);
    }
    setIsLoading(false);
  };

  const handleSavePurchaseReceiptDetail = async (purchaseReceiptId: string) => {
    const productsReceipt = productStatus.map((product) => ({
      purchaseReceiptId: purchaseReceiptId,
      productSupplierId: product.productId,
      quantity: product.accepted,
    }));

    const { error } = await supabase.from('purchaseReceiptDetail').insert(productsReceipt);

    if (error) {
      showToast(error.message, false);
    } else {
      handleChangeInventory();
      handleChangeStatePurchase(2);
    }
  }

  const handleChangeInventory = async () => {
    for (const product of productStatus) {
      const { data: existingInventory, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('productSupplierId', product.productId)
        .eq('storeHouseId', formData.storeHouseId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        showToast(fetchError.message, false);
        continue;
      }

      if (!existingInventory) {
        const { error: insertError } = await supabase.from('inventory').insert({
          productSupplierId: product.productId,
          storeHouseId: formData.storeHouseId,
          stock: product.accepted,
          createdAt: new Date(),
          lastUpdate: new Date(),
        });

        if (insertError) {
          showToast(insertError.message, false);
        }
      } else {
        const updatedStock = existingInventory.stock + product.accepted;
        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            stock: updatedStock,
            lastUpdate: new Date(),
          })
          .eq('inventoryId', existingInventory.inventoryId);

        if (updateError) {
          showToast(updateError.message, false);
        }
      }
    }
  };

  const markAllProducts = (option: 'accept' | 'reject') => {
    const updatedStatus = formData.products.map((product) => ({
      productId: product.productId,
      accepted: option === 'accept' ? product.orderedQuantity : 0,
      rejected: option === 'reject' ? product.orderedQuantity : 0,
    }));
    setProductStatus(updatedStatus);
  };

  const handleSaveInventoryMovement = async () => {
    const inventoryMovement = productStatus.map(({ productId, accepted }) => {
      const productInForm = formData.products.find(p => p.productId === productId);
      const cost = productInForm ? Number(productInForm.cost) : 0;
      const quantity = Number(accepted);

      return {
        productSupplierId: productId,
        typeMovement: 0,
        quantity,
        cost: Number(cost.toFixed(2)),
        total: Number((quantity * cost).toFixed(2)),
        referenceId: purchaseId,
        storeHouseId: formData.storeHouseId,
      };
    });

    const { error } = await supabase.from('inventoryMovements').insert(inventoryMovement)

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Inventario recibido', true);
    }
  }

  const handleChangeStatePurchase = async (newState: number) => {
    const { error } = await supabase.from('purchaseOrder').update({ state: newState }).eq('purchaseOrderId', purchaseId);

    if (error) {
      showToast(error.message, false);
    } else {
      setFormData({ ...formData, state: newState });
      handleSaveInventoryMovement();
    }
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  }

  return (
    <Container onSaveClick={handleFormSubmit} save={formData.state < 2} text="Cambios no guardados" isLoading={isLoading}>
      {canReceiveInventory ? (
        <section className="max-w-[950px] flex flex-1 flex-col mt-2 w-full mx-auto">
          <SubHeader backUrl={`/purchases/receive/${purchaseId}`} title="Recibir inventario" />
          <form ref={formRef} onSubmit={handleSubmit} className="w-full">
            <FormSection className="px-0">
              <>
                <header className="flex px-4 md:flex-row flex-col md:items-center md:justify-between">
                  <h2 className="text-secondary font-semibold md:text-sm text-base">Productos</h2>
                  {formData.state < 2 &&
                    <div className="flex items-center md:justify-start justify-between space-x-2 md:mt-0 mt-4">
                      <Button onClick={() => handleChangeOption('accept')} type="button" name="Aceptar todo" styleButton="none" className="md:text-2xs text-base font-medium text-blueprimary hover:text-bluesecondary hover:underline" />
                      <Button onClick={() => handleChangeOption('reject')} type="button" name="Rechazar todo" styleButton="none" className="md:text-2xs text-base font-medium text-blueprimary hover:text-bluesecondary hover:underline" />
                    </div>
                  }
                  {isShowModal &&
                    <Modal
                      principalButtonName={`${selectedOption === 'accept' ? 'Aceptar' : 'Rechazar'} y guardar`}
                      onClose={() => setIsShowModal(false)}
                      onClickSave={() => {
                        if (selectedOption) {
                          markAllProducts(selectedOption);
                          setIsShowModal(false);
                        }
                      }}
                      name={`¿${selectedOption === 'accept' ? 'Aceptar' : 'Rechazar'} todas las unidades?`}
                    >
                      <p className="font-medium text-2xs text-secondary/90 p-4">
                        Esta acción marcará todas las unidades como {selectedOption === 'accept' ? 'aceptadas' : 'rechazadas'}, guardará la orden de compra y actualizará el inventario.
                      </p>
                    </Modal>
                  }

                </header>

                <main className="mt-6">
                  <ProgressBar
                    className="px-6"
                    total={formData?.products.reduce((acc, product) => acc + product.orderedQuantity, 0) ?? 0}
                    value1={productStatus.reduce((acc, status) => acc + status.accepted, 0)}
                    value2={productStatus.reduce((acc, status) => acc + status.rejected, 0)}
                  />

                  <div className="relative md:block hidden overflow-x-auto mt-3 px-px">
                    <table className="w-full text-left">
                      <thead className="text-primary px-4 font-semibold text-2xs border-b border-gray-300">
                        <tr>
                          {HEADER.map((th, index) => (
                            <th key={index} scope="col" className={th.className}>
                              {th.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData?.products.map(({ productId, productName, orderedQuantity }) => (
                          <tr key={productId} className="bg-white border-b font-medium text-sm border-gray-200">
                            <th className="px-4 py-4 w-[30%] text-blueprimary hover:underline font-medium cursor-pointer"><Link to={`/products/add/${productId}`}>{productName}</Link></th>
                            <td className="px-2 py-4">
                              <div className="flex items-center space-x-2">
                                <FieldInput
                                  isNumber
                                  value={productStatus.find(item => item.productId === productId)?.accepted || ''}
                                  onChange={(e) => handleInputChange(productId, 'accepted', Number(e.target.value))}
                                  className="mb-0"
                                  disabled={formData.state >= 2}
                                />
                                <Button disabled={formData.state === 2} onClick={() => { handleInputChange(productId, 'accepted', orderedQuantity); handleInputChange(productId, 'rejected', 0) }} name="Todo" styleButton="primary" type="button" className="px-3 py-1 text-2xs disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5] font-semibold text-secondary/80" />
                              </div>
                            </td>
                            <td className="px-2 py-4">
                              <div className="flex items-center space-x-2">
                                <FieldInput
                                  isNumber
                                  value={productStatus.find(item => item.productId === productId)?.rejected || ''}
                                  onChange={(e) => handleInputChange(productId, 'rejected', Number(e.target.value))}
                                  className="mb-0"
                                  disabled={formData.state >= 2}
                                />
                                <Button disabled={formData.state >= 2} onClick={() => { handleInputChange(productId, 'rejected', orderedQuantity); handleInputChange(productId, 'accepted', 0) }} name="Todo" styleButton="primary" type="button" className="px-3 py-1 text-2xs disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5] font-semibold text-secondary/80" />
                              </div>
                            </td>
                            <td className="px-6 py-4 w-[25%]">
                              <ProgressBar
                                isShowLabel={false}
                                total={orderedQuantity}
                                value1={productStatus.find(item => item.productId === productId)?.accepted || 0}
                                value2={productStatus.find(item => item.productId === productId)?.rejected || 0}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 mt-6 border-y border-gray-300 py-5 md:hidden block">
                    {formData?.products.map(({ productId, productName, orderedQuantity }) => (
                      <div key={productId}>
                        <Link to={`/products/add/${productId}`} className="font-medium text-blueprimary hover:underline hover:text-bluesecondary">{productName}</Link>
                        <div className="flex items-center space-x-2 mt-5">
                          <div className="flex items-center space-x-2">
                            <FieldInput
                              isNumber
                              value={productStatus.find(item => item.productId === productId)?.accepted || ''}
                              onChange={(e) => handleInputChange(productId, 'accepted', Number(e.target.value))}
                              className="mb-0 w-full"
                              disabled={formData.state >= 2}
                            />
                            <Button disabled={formData.state === 2} onClick={() => { handleInputChange(productId, 'accepted', orderedQuantity); handleInputChange(productId, 'rejected', 0) }} name="Todo" styleButton="primary" type="button" className="px-4 py-1 text-2xs h-11 shadow-none active:shadow-none border disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5] font-semibold text-secondary/80" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <FieldInput
                              isNumber
                              value={productStatus.find(item => item.productId === productId)?.rejected || ''}
                              onChange={(e) => handleInputChange(productId, 'rejected', Number(e.target.value))}
                              className="mb-0 w-full"
                              disabled={formData.state >= 2}
                            />
                            <Button disabled={formData.state >= 2} onClick={() => { handleInputChange(productId, 'rejected', orderedQuantity); handleInputChange(productId, 'accepted', 0) }} name="Todo" styleButton="primary" type="button" className="px-4 py-1 text-2xs h-11 shadow-none active:shadow-none border disabled:shadow-none disabled:cursor-default disabled:bg-[#f2f2f2] disabled:text-[#beb8b5] font-semibold text-secondary/80" />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <ProgressBar
                            isShowLabel={false}
                            className="mt-5 w-2/3"
                            total={orderedQuantity}
                            value1={productStatus.find(item => item.productId === productId)?.accepted || 0}
                            value2={productStatus.find(item => item.productId === productId)?.rejected || 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <span className="font-medium md:text-2xs text-base text-secondary/90 inline-block mx-4 mt-4">{formData?.products.length} productos en la orden de compra</span>
                </main>
              </>
            </FormSection>
          </form>
        </section>
      ) : (
        <AccessPage />
      )}
    </Container >
  );
}
