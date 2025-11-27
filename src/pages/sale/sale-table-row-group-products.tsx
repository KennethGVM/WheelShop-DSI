import { SaleProps } from "@/types/types";

interface GroupedProduct {
  storeHouse: string;
  items: { productName: string; quantity: number }[];
}

export function groupProductsByStorehouseWithReturns(sale: SaleProps): GroupedProduct[] {
  const map = new Map<
    string,
    { storeHouse: string; productName: string; quantity: number }
  >();

  // 1. Cargar productos vendidos
  for (const p of sale.products) {
    map.set(p.productSupplierId, {
      storeHouse: p.storeHouseName,
      productName: p.productName,
      quantity: p.quantity,
    });
  }

  // 2. Aplicar devoluciones y cambios
  const returnDetails = sale.return?.[0]?.returnDetail || [];
  for (const r of returnDetails) {
    const existing = map.get(r.productSupplierId);

    if (existing) {
      // Ya existía el producto
      if (r.type === false) {
        existing.quantity -= r.quantity; // Devolución
      } else {
        existing.quantity += r.quantity; // Cambio
      }

      // Si la cantidad final es cero o negativa, lo quitamos
      if (existing.quantity <= 0) {
        map.delete(r.productSupplierId);
      } else {
        map.set(r.productSupplierId, existing);
      }
    } else if (r.type === true) {
      // Producto recibido solo como cambio (no estaba en la venta original)
      map.set(r.productSupplierId, {
        storeHouse: r.storeHouseName || "Cambio",
        productName: r.productName || "Producto sin nombre",
        quantity: r.quantity,
      });
    }
    // Si el producto es devolución y no está en la venta original, se ignora
  }

  // 3. Agrupar por bodega
  const grouped: Record<string, { productName: string; quantity: number }[]> = {};
  for (const value of map.values()) {
    if (value.quantity > 0) {
      if (!grouped[value.storeHouse]) grouped[value.storeHouse] = [];
      grouped[value.storeHouse].push({
        productName: value.productName,
        quantity: value.quantity,
      });
    }
  }

  // 4. Convertir a array
  return Object.entries(grouped).map(([storeHouse, items]) => ({
    storeHouse,
    items,
  }));
}
