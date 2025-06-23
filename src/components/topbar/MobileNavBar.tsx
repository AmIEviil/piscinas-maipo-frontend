import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import { PAGE_ROUTES } from "../../constant/routes";
import { useLocation, useNavigate } from "react-router";

export default function CustomNavBar() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  const actualRoute = location.pathname.replace("/", "") || "Home";

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/")}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(PAGE_ROUTES.Clientes)}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(PAGE_ROUTES.Inventario)}>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Inventario" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>
        <span>
          {actualRoute.charAt(0).toUpperCase() + actualRoute.slice(1)}
        </span>
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
