import { useEffect, useState } from "react";

import style from "../client/BodyClients/BodyClients.module.css";
// import Select from "../ui/Select/Select";
// import InputText from "../ui/InputText/InputText";
import TableGeneric from "../ui/table/Table";

// import type { SelectChangeEvent } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { formatMoneyNumber } from "../../utils/formatTextUtils";
import { titlesInventoryTable } from "../../constant/constantBodyClient";

import { type IProducto } from "../../service/productsInterface";
import { useProducts } from "../../hooks/ProductHooks";

const BodyInventory = () => {
  const productsMutation = useProducts();

  const [products, setProducts] = useState<IProducto[]>();
  const [loadingTable, setLoadingTable] = useState(false);

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

  return (
    <div>
      <div>
        <label>
          Aqui se mostrara toda la información sobre los clientes activos
        </label>
      </div>
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
          <Tooltip title="Agregar nuevo Cliente" arrow leaveDelay={0}>
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
                <Tooltip title="Ver detalles Cliente" arrow leaveDelay={0}>
                  <button
                    className="actions"
                    // onClick={() => handleOpenDialog(client)}
                  >
                    <VisibilityIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Editar Cliente" arrow leaveDelay={0}>
                  <button
                  //   onClick={() => handleEditClient(client)}
                  >
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip title="Eliminar Producto" arrow leaveDelay={0}>
                  <button
                  // onClick={() =>
                  //   client.id !== undefined && handleDeleteClient(client.id)
                  // }
                  >
                    <DeleteIcon className={style.iconAction} />
                  </button>
                </Tooltip>
              </td>
            </tr>
          )}
        />
      </div>
      {/* <InfoClientDialog
        open={openDialog}
        onClose={handleCloseDialog}
        clientInfo={selectedClient ?? undefined}
        maintenancesClient={mantenciones ?? undefined}
      />
      <CreateClientDialog
        open={openCreateDialog}
        onClose={handleCloseDialog}
        isEditMode={isEditMode}
        clientInfo={selectedClient ?? undefined}
      /> */}
    </div>
  );
};

export default BodyInventory;
