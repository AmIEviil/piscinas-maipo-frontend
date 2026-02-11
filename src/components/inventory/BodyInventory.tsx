/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";

import style from "../client/BodyClients/BodyClients.module.css";
import InputText from "../ui/InputText/InputText";
import TableGeneric from "../ui/table/Table";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import { formatMoneyNumber } from "../../utils/formatTextUtils";
import { titlesInventoryTable } from "../../constant/constantBodyClient";

import { type IProducto } from "../../service/products.interface";
import { useDeleteProduct, useProducts } from "../../hooks/ProductHooks";
import CreateProductDialog from "./CreateProduct/CreateProductDialog";
import InfoProductDialog from "./InfoProduct/InfoDialogProduct";
import debounce from "lodash.debounce";
import { formatNoResultsText } from "../../utils/FiltersUtils";
import { useTypesProductStore } from "../../store/ProductStore";
import TrashIcon from "../ui/Icons/TrashIcon";
import { useRefetchStore } from "../../store/refetchStore";
import CustomModal from "../ui/modal/CustomModal";
import CustomSelect from "../ui/Select/Select";

interface IfilterQuery {
  nombre?: string;
  tipoId?: string;
}

const initial_filters: IfilterQuery = {
  nombre: "",
  tipoId: "",
};

const BodyInventory = () => {
  const productsMutation = useProducts();
  const deleteProductMutation = useDeleteProduct();

  const { shouldRefetch } = useRefetchStore();
  const { productsTypes, fetchProductsTypes } = useTypesProductStore();

  const [products, setProducts] = useState<IProducto[]>();
  const [loadingTable, setLoadingTable] = useState(false);
  const [filterQuery, setFilterQuery] = useState<IfilterQuery>(initial_filters);
  const [selectedProduct, setSelectedProduct] = useState<IProducto | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);

  const [nombreInput, setNombreInput] = useState("");

  const [kindToCreate, setKindToCreate] = useState<string>("");

  const fetchData = async () => {
    setLoadingTable(true);
    try {
      const products = await productsMutation.mutateAsync(filterQuery);
      setProducts(products);
      setLoadingTable(false);
    } catch (error) {
      console.log("Error al cargar los productos:", error);
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (productsTypes.length === 0) {
      fetchProductsTypes();
    }
  }, [productsTypes.length, fetchProductsTypes]);

  const handleFilterName = useMemo(
    () =>
      debounce((value: string) => {
        setFilterQuery((prev) => {
          if (value.length >= 3) {
            return { ...prev, nombre: value };
          } else if (value.length === 0) {
            // eliminar filtro nombre cuando está vacío
            const updated = { ...prev };
            delete updated.nombre;
            return updated;
          }
          return prev ?? {};
        });
      }, 500),
    []
  );

  useEffect(() => {
    fetchData();
  }, [shouldRefetch, filterQuery]);

  const handleOpenCreateDialog = (kind: string) => {
    setKindToCreate(kind);
    setOpenCreateDialog(true);
  };

  const handleSeeProduct = (product: IProducto) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleEditProduct = (product: IProducto) => {
    setKindToCreate("product");
    setSelectedProduct(product);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
    setSelectedProduct(null);
    setIsEditMode(false);
    setKindToCreate("");
  };

  const handleClosePopUp = () => {
    setOpenPopUp(false);
  };

  const handleOpenDeletePopUp = (product: IProducto) => {
    setSelectedProduct(product);
    setOpenPopUp(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
      fetchData();
      handleClosePopUp();
    } catch (error) {
      console.error("Error eliminando al producto:", id, error);
    }
  };

  const handleClearFilter = () => {
    setFilterQuery({});
    setNombreInput("");
  };

  const handleTextNoResults = () => {
    if (filterQuery.nombre) {
      return formatNoResultsText(nombreInput, "productos");
    }
  };

  const hasFilters = filterQuery.nombre || filterQuery.tipoId;

  return (
    <div>
      <div className={style.filtersContainer}>
        <div className={style.filters}>
          <InputText
            title="Buscar por Nombre"
            placeholder="Nombre"
            onChange={handleFilterName}
            value={filterQuery.nombre || nombreInput}
          />
          <CustomSelect
            label="Filtrar por Tipo"
            options={productsTypes.map((type) => ({
              label: type.nombre,
              value: type.id,
            }))}
            value={filterQuery.tipoId || ""}
            onChange={(value) => {
              const stringValue = String(value.target.value);
              console.log("Selected type:", stringValue);
              setFilterQuery((prev) => {
                if (stringValue.length > 0) {
                  return { ...prev, tipoId: stringValue };
                } else {
                  const updated = { ...prev };
                  delete updated.tipoId;
                  return updated;
                }
              });
            }}
          />
        </div>
        <div className={style.actionsFilters}>
          {hasFilters && (
            <Tooltip title="Limpiar Filtros" arrow leaveDelay={0}>
              <button
                onClick={handleClearFilter}
                className={style.actionButton}
              >
                <TrashIcon />
              </button>
            </Tooltip>
          )}
          <Tooltip title="Agregar nuevo Producto" arrow leaveDelay={0}>
            <button onClick={() => handleOpenCreateDialog("product")}>
              Agregar nuevo Producto
              <AddIcon />
            </button>
          </Tooltip>
          <Tooltip title="Agregar nuevo Tipo de Producto" arrow leaveDelay={0}>
            <button onClick={() => handleOpenCreateDialog("type")}>
              Agregar nuevo Tipo de Producto
              <AddIcon />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className={style.tableContainer}>
        <TableGeneric
          titles={titlesInventoryTable}
          data={products ?? []}
          loading={loadingTable}
          textNotFound={handleTextNoResults()}
          renderRow={(product) => (
            <tr key={product.id}>
              <td>{product.nombre}</td>
              <td>{product.tipo?.nombre}</td>
              <td>{product.cant_disponible}</td>
              <td>{formatMoneyNumber(product.valor_unitario)}</td>
              <td className="flex flex-col gap-2 sm:gap-4 items-center justify-center">
                <Tooltip title="Ver Producto" arrow leaveDelay={0}>
                  <button onClick={() => handleSeeProduct(product)}>
                    <VisibilityIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Editar Producto" arrow leaveDelay={0}>
                  <button onClick={() => handleEditProduct(product)}>
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Eliminar Producto" arrow leaveDelay={0}>
                  <button
                    onClick={() =>
                      product.id !== undefined && handleOpenDeletePopUp(product)
                    }
                  >
                    <TrashIcon className={style.iconAction} />
                  </button>
                </Tooltip>
              </td>
            </tr>
          )}
        />
      </div>
      <InfoProductDialog
        open={openDialog}
        onClose={handleCloseDialog}
        productInfo={selectedProduct ?? undefined}
      />
      <CreateProductDialog
        key={`dialog-${selectedProduct?.id}`}
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isEditMode={isEditMode}
        productInfo={selectedProduct ?? undefined}
        kind={kindToCreate}
        productTypes={productsTypes}
      />
      <CustomModal
        open={openPopUp}
        onClose={handleClosePopUp}
        title="Confirmar eliminación"
        confirmLabel="Eliminar"
        content={
          <div className="flex flex-col gap-4 text-center">
            <p>¿Estás seguro de que deseas eliminar este producto?</p>
            <p className="font-bold">{selectedProduct?.nombre}</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
        }
        onConfirm={() => {
          handleDeleteProduct(selectedProduct?.id ?? "");
        }}
      />
    </div>
  );
};

export default BodyInventory;
