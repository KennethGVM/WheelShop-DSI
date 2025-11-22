export const MODULES = [
  {
    moduleName: "Productos",
    subModules: [
      {
        subModuleName: "Crear y editar",
        subSubModules: [
          { subSubModuleName: "Editar costo" },
          { subSubModuleName: "Editar precio" }
        ]
      },
      {
        subModuleName: "Ver",
        subSubModules: [
          { subSubModuleName: "Ver costo" }
        ]
      },
      { subModuleName: "Exportar", subSubModules: [] },
      { subModuleName: "Eliminar", subSubModules: [] }
    ]
  },
  {
    moduleName: "Pedidos",
    subModules: [
      { subModuleName: "Exportar", subSubModules: [] },
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Crear", subSubModules: [] },
      { subModuleName: "Establecer términos de pago", subSubModules: [] },
      { subModuleName: "Gestionar información de pedidos", subSubModules: [] },
      { subModuleName: "Registrar pagos", subSubModules: [] },
      { subModuleName: "Cancelar", subSubModules: [] },
      { subModuleName: "Eliminar", subSubModules: [] },
      { subModuleName: "Gestionar devoluciones", subSubModules: [] },
      { subModuleName: "Aplicar descuentos", subSubModules: [] },
    ]
  },
  {
    moduleName: "Ordenes de compras",
    subModules: [
      { subModuleName: "Establecer términos de pago", subSubModules: [] },
      { subModuleName: "Registrar pagos", subSubModules: [] },
      { subModuleName: "Cancelar", subSubModules: [] },
      { subModuleName: "Exportar", subSubModules: [] },
      { subModuleName: "Eliminar", subSubModules: [] },
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Gestionar información de ordenes", subSubModules: [] },
      {
        subModuleName: "Editar ordenes de compra",
        subSubModules: [
          { subSubModuleName: "Aplicar descuentos" }
        ]
      },
      { subModuleName: "Establecer como ordenado", subSubModules: [] },
      { subModuleName: "Recibir inventario", subSubModules: [] }
    ]
  },
  {
    moduleName: "Inventario",
    subModules: [
      { subModuleName: "Gestionar ajustes de inventario", subSubModules: [] },
      { subModuleName: "Exportar", subSubModules: [] },
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Ver movimientos", subSubModules: [] },
      { subModuleName: "Editar", subSubModules: [] }
    ]
  },
  {
    moduleName: "Inicio",
    subModules: [
      { subModuleName: "Inicio", subSubModules: [] }
    ]
  },
  {
    moduleName: "Informes y estadísticas",
    subModules: [
      { subModuleName: "Informes", subSubModules: [] },
    ]
  },
  {
    moduleName: "Descuentos",
    subModules: [
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Crear y editar", subSubModules: [] },
      { subModuleName: "Eliminar", subSubModules: [] }
    ]
  },
  {
    moduleName: "Clientes",
    subModules: [
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Crear y editar", subSubModules: [] },
      { subModuleName: "Exportar", subSubModules: [] },
      { subModuleName: "Ver transacciones de credito en tienda", subSubModules: [] },
      { subModuleName: "Eliminar", subSubModules: [] }
    ]
  },
  {
    moduleName: "Caja",
    subModules: [
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Crear y editar", subSubModules: [] },
      { subModuleName: "Gestionar apertura de caja", subSubModules: [] },
      { subModuleName: "Arquear caja", subSubModules: [] },
      { subModuleName: "Cerrar caja", subSubModules: [] }
    ]
  },
  {
    moduleName: "Cotizaciones",
    subModules: [
      { subModuleName: "Ver", subSubModules: [] },
      { subModuleName: "Crear y editar", subSubModules: [] }
    ]
  }
];
