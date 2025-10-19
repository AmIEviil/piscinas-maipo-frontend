import { useEffect, useState } from "react";

import style from "../client/BodyClients/BodyClients.module.css";
// import Select from "../ui/Select/Select";
// import InputText from "../ui/InputText/InputText";
import TableGeneric from "../ui/table/Table";

// import type { SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { formatMoneyNumber } from "../../utils/formatTextUtils";
import { titlesInventoryTable } from "../../constant/constantBodyClient";

import { type IProducto } from "../../service/productsInterface";
import { useProducts } from "../../hooks/ProductHooks";
import CreateProductDialog from "./CreateProduct/CreateProductDialog";
import InfoProductDialog from "./InfoProduct/InfoDialogProduct";
import PopUp from "../ui/PopUp/PopUp";

const BodyInventory = () => {
  const productsMutation = useProducts();

  const [products, setProducts] = useState<IProducto[]>();
  const [loadingTable, setLoadingTable] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProducto | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);

  const fetchData = async () => {
    setLoadingTable(true);
    try {
      const products = await productsMutation.mutateAsync();
      setProducts(products);
      setLoadingTable(false);
    } catch (error) {
      console.log("Error al cargar los productos:", error);
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const handleOpenDialog = async (product: IProducto) => {
  //   setSelectedProduct(product);
  //   handleSeeDetailsProduct(product);
  //   setOpenDialog(true);
  // };

  const handleEditProduct = (product: IProducto) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setOpenCreateDialog(true);
  };

  // const handleSeeDetailsProduct = async (product: IProducto) => {
  //   setSelectedProduct(product);
  //   try {
  //     if (!product.id) return;
  //     setOpenDialog(true);
  //   } catch (error) {
  //     console.error("Error cargando mantenciones:", error);
  //   }
  // };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenCreateDialog(false);
  };

  const handleClosePopUp = () => {
    setOpenPopUp(false);
  };

  const handleOpenDeletePopUp = (product: IProducto) => {
    setSelectedProduct(product);
    setOpenPopUp(true);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      // await deleteProductMutation.mutateAsync(id);
      // fetchData();
      console.log("Producto eliminado:", id);
      setOpenPopUp(false);
    } catch (error) {
      console.error("Error eliminando al producto:", id, error);
    }
  };

  return (
    <div>
      <div className={style.filtersContainer}>
        {/* <div className={style.filters}>
          <InputText
            title="Buscar por Nombre"
            placeholder="Nombre"
            onChange={handleFilterName}
            value={nombreInput}
          />
        </div>
        <div className={style.filters}>
          <InputText
            title="Buscar por dirección"
            placeholder="Dirección"
            onChange={handleFilterDireccion}
            value={direccionInput}
          />
        </div>
        <div className={`${style.filters} select`}>
          <Select
            label="Dia Mantención"
            options={dias}
            onChange={handleChangeDiaMantencion}
            value={selectedDay}
          />
        </div>
        <div className={style.filters}>
          <Select
            label="Comuna"
            options={comunas}
            onChange={handleChangeComuna}
            value={selectedComuna}
          />
        </div> */}
        <div className={style.actionsFilters}>
          <Tooltip title="Limpiar Filtros" arrow leaveDelay={0}>
            <button
            // onClick={handleClearFilter} className={style.actionButton}
            >
              <SearchOffIcon />
            </button>
          </Tooltip>
          <Tooltip title="Agregar nuevo Producto" arrow leaveDelay={0}>
            <button
            // onClick={handleOpenCreateDialog}
            >
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
          renderRow={(product) => (
            <tr key={product.id}>
              <td>{product.nombre}</td>
              <td>{product.nombre}</td>
              <td>{product.cant_disponible}</td>
              <td>{formatMoneyNumber(product.valor_unitario)}</td>
              <td>
                {/* <Tooltip title="Ver detalles Cliente" arrow leaveDelay={0}>
                  <button
                    className="actions"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <VisibilityIcon />
                  </button>
                </Tooltip> */}
                <Tooltip title="Editar Producto" arrow leaveDelay={0}>
                  <button onClick={() => handleEditProduct(product)}>
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Eliminar Producto" arrow leaveDelay={0}>
                  <button
                    onClick={() =>
                      product.id !== undefined &&
                      handleOpenDeletePopUp(product)
                    }
                  >
                    <DeleteIcon className={style.iconAction} />
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
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isEditMode={isEditMode}
        productInfo={selectedProduct ?? undefined}
      />
      <PopUp
        open={openPopUp}
        onClose={handleClosePopUp}
        onConfirm={() => {
          handleDeleteProduct(selectedProduct?.id ?? 0);
        }}
        title="Confirmar eliminación"
        confirmText="Eliminar"
      >
        <div className="flex flex-col gap-4 text-center">
          <p>¿Estás seguro de que deseas eliminar este producto?</p>
          <p className="font-bold">{selectedProduct?.nombre}</p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
      </PopUp>
    </div>
  );
};

export default BodyInventory;
