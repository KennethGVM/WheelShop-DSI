import FieldInput from "@/components/form/field-input";
import FieldSelect from "@/components/form/field-select";
import Modal from "@/components/modal";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import { CurrencyProps, ExpenseProps, PaymentMethodProps } from "@/types/types";
import { useAuth } from "@/api/auth-provider";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import TextArea from "@/components/form/text-area";
import { useGeneralInformation } from "@/api/general-provider";

interface AddExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  setExpenses: Dispatch<SetStateAction<ExpenseProps[]>>;
}

export default function AddExpense({ isOpen, onClose, setExpenses }: AddExpenseProps) {
  const { dollarValue = 0 } = useGeneralInformation();
  const { user } = useAuth();
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodProps[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "",
    paymentMethod: "",
    dollarChange: dollarValue,
    type: "false",
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: currencyData } = await supabase.from("currency").select("*");
      const { data: paymentMethodData } = await supabase.from("paymentMethod").select("*");

      if (currencyData?.length) {
        setCurrencies(currencyData);
        setFormData((prev) => ({ ...prev, currency: currencyData[0].currencyId }));
      }

      if (paymentMethodData?.length) {
        setPaymentMethods(paymentMethodData);
        setFormData((prev) => ({ ...prev, paymentMethod: paymentMethodData[0].paymentMethodId }));
      }
    };

    if (isOpen) loadData();
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    const { name, description, amount, currency, paymentMethod, type } = formData;

    if (!user?.id || !name || !amount || !currency || !paymentMethod) {
      showToast("Por favor complete todos los campos requeridos", false);
      return;
    }

    const { error } = await supabase.rpc("submitexpense", {
      p_userid: user.id,
      p_name: name,
      p_description: description,
      p_amount: parseFloat(amount),
      p_currencyid: currency,
      p_paymentmethodid: paymentMethod,
      p_dollarchange: dollarValue,
      p_iscommission: type === "true",
    });

    if (error) {
      showToast("Error al guardar el gasto", false);
      return;
    }

    // Obtener los nombres para mostrar en la tabla
    const currencyName = currencies.find((c) => c.currencyId === currency)?.currencyName || "";
    const paymentMethodName = paymentMethods.find((m) => m.paymentMethodId === paymentMethod)?.namePaymentMethod || "";

    // Crear el nuevo objeto localmente
    const newExpense: ExpenseProps = {
      amount: parseFloat(amount),
      currencyName,
      description,
      expenseId: "", // temporal, ya que no lo retorna Supabase
      name,
      paymentMethodName,
      userName: user.email || "",
      createdAt: new Date,
      currencyId: currency,
      paymentMethodId: paymentMethod,
      userId: user.id,
      dollarChange: dollarValue || 0,
      isCommission: type === "true",
    };

    setExpenses((prev) => [newExpense, ...prev]);
    showToast(type === "true" ? "Comisión creada" : "Gasto creado", true);
    onClose();
  };
  const isCommission = formData.type === "true";
  return (
    <Modal
      name="Agregar Gasto / Comisión"
      onClickSave={handleSave}
      classNameModal="px-4 py-3"
      principalButtonName="Guardar"
      onClose={onClose}
    >
      <div className="flex items-center space-x-3 [&>*]:w-full mt-2">

        <FieldInput
          className="w-full"
          name="Nombre"
          id="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={`${isCommission ? "Nombre de la comisión" : "Nombre del gasto"}`}
        />
        <FieldSelect
          name="Categoria"
          id="type"
          value={formData.type}
          onChange={handleInputChange}
          options={[
            { name: "Gasto", value: "false" },
            { name: "Comisión", value: "true" },
          ]}
        />
      </div>
      <TextArea
        name="Descripción"
        id="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder={`Descripción ${isCommission ? "de la comisión" : "del gasto"}`}
        rows={5}
      />
      <FieldInput
        name="Monto"
        id="amount"
        type="number"
        value={formData.amount}
        onChange={handleInputChange}
        placeholder="0.00"
        className="mb-0"
      />

      <div className="flex items-center space-x-3 [&>*]:w-full mt-3">
        <FieldSelect
          name="Moneda"
          id="currency"
          value={formData.currency}
          onChange={handleInputChange}
          options={currencies.map((currency) => ({
            name: currency.currencyName,
            value: currency.currencyId,
          }))}
        />
        <FieldSelect
          name="Método de Pago"
          id="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          options={paymentMethods.map((method) => ({
            name: method.namePaymentMethod,
            value: method.paymentMethodId,
          }))}
        />
      </div>
    </Modal>
  );
}
