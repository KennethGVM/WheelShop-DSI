import { useRolePermission } from "@/api/permissions-provider";
import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import StatusTags from "@/components/status-tags";
import { ArrowDownIcon } from "@/icons/icons";
import { getPermissions } from "@/lib/function";
import { ProductFilter, ProductProps } from "@/types/types"

interface ProductTableRowProps {
  products: ProductProps[];
  product: ProductProps
  selectedProductIds: string[];
  handleEditProduct: (productId: string) => void;
  filter: ProductFilter;
  isScrolled: boolean;
  handleSelectProduct: (productId: string, checked: boolean) => void;
}

export default function ProductTableRow({ handleSelectProduct, isScrolled, products, product, handleEditProduct, selectedProductIds, filter }: ProductTableRowProps) {
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canEditProduct = getPermissions(permissions, "Productos", "Crear y editar")?.canAccess;


  return (
    <>
      <tr
        onDoubleClick={() => canEditProduct && handleEditProduct(product.productId)}
        className={`${selectedProductIds.includes(product.productId) ? 'bg-whiting2' : 'bg-white'} cursor-pointer text-2xs font-medium ${product !== products[products.length - 1] ? 'border-b' : ''} text-secondary/80 border-gray-300 group hover:bg-[#F7F7F7]`}
      >
        <td
          className={`px-2 py-4 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
    before:content-[''] before:absolute before:top-0 before:right-0
    before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
    ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedProductIds.includes(product.productId) ? 'bg-whiting2' : 'bg-white'}`}
        >
          <div className="flex items-center space-x-2">
            <CheckBox
              initialValue={selectedProductIds.includes(product.productId)}
              onChange={(value) => handleSelectProduct(product.productId, value)}
            />
            <span>{product.name}</span>
          </div>
        </td>


        <td className="py-4">
          <StatusTags status={product.state} text={product.state ? 'Activo' : 'Inactivo'} />
        </td>
                {filter == "Productos Varios" &&
          <td>
            <span>{product.description}</span>
          </td>
        }
        <td className={`py-4 ${product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0) < 10 ? 'text-red-900' : 'text-secondary/80'}`}>
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1">
                <span>{product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0)} en stock</span>
                <ArrowDownIcon className={`size-4 stroke-none ${product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0) < 10 ? 'fill-red-900' : 'fill-secondary/80'}`} />
              </button>
            </DropdownTrigger>
            {product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0) > 0 &&
              <DropdownContent align="end" className="rounded-2xl">
                {product.storeHouseInventory.map(({ stock, storeHouse }, index) => (
                  <>
                    <DropdownItem className="justify-between w-[250px] hover:bg-transparent">
                      <div className="flex items-center space-x-3">
                        <div className="size-2.5 rounded-[3px] border border-gray-400" />
                        <span>{storeHouse}</span>
                      </div>
                      <span>{stock}</span>
                    </DropdownItem>

                    {index !== product.storeHouseInventory.length - 1 && <DropdownSeparator />}
                  </>
                ))}
              </DropdownContent>
            }
          </Dropdown>
        </td>
        {filter !== "Productos Varios" &&
          <>
            <td className="">{filter === "Llantas" ? product.nameTypeVehicle : product.brandOilName}</td>
          </>
        }

        {filter !== 'Productos Varios' &&
          <td>
            {filter === "Llantas"
              ? product.brandName
              : product.isDiesel
                ? 'Diesel'
                : 'Gasolina'}
          </td>
        }
        {filter !== "Productos Varios" &&
          <td>
            {filter === "Llantas"
              ? product.numeration
              : product.numerationOil}
          </td>
        }
      </tr>
    </>
  )
}