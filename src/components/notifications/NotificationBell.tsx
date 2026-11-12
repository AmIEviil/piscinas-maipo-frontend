import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    actionLoading,
    isIOS,
    isStandalone,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const handleOpen = () => {
    setMessage(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setMessage(null);
  };

  const handleSubscribe = async () => {
    try {
      setMessage(null);
      await subscribe();
      setMessage({
        text: "¡Notificaciones activadas exitosamente!",
        type: "success",
      });
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Error al activar notificaciones.",
        type: "error",
      });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setMessage(null);
      await unsubscribe();
      setMessage({
        text: "Notificaciones desactivadas en este dispositivo.",
        type: "info",
      });
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Error al desactivar notificaciones.",
        type: "error",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      setMessage(null);
      const success = await sendTestNotification();
      if (success) {
        setMessage({
          text: "¡Notificación de prueba enviada! Deberías verla en tu pantalla en unos segundos.",
          type: "success",
        });
      } else {
        setMessage({
          text: "No se pudo entregar la notificación de prueba. Verifica tu conexión.",
          type: "error",
        });
      }
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Error al enviar notificación de prueba.",
        type: "error",
      });
    }
  };

  return (
    <>
      <Tooltip title={isSubscribed ? "Notificaciones Push Activas" : "Configurar Notificaciones"}>
        <IconButton
          onClick={handleOpen}
          aria-label="Notificaciones Push"
          sx={{
            color: "white",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.08)",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            },
          }}
          size="medium"
        >
          <Badge
            color={isSubscribed ? "success" : "warning"}
            variant="dot"
            invisible={!isSupported || loading}
          >
            {isSubscribed ? (
              <NotificationsActiveIcon fontSize="medium" />
            ) : (
              <NotificationsIcon fontSize="medium" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "1.2rem",
            pb: 1,
          }}
        >
          <span>Notificaciones Push</span>
          <IconButton onClick={handleClose} size="small" aria-label="cerrar">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {message && (
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          {!isSupported ? (
            <Alert severity="warning">
              Tu navegador actual no soporta la API de notificaciones push. Te recomendamos usar Chrome, Edge o Firefox.
            </Alert>
          ) : isIOS && !isStandalone ? (
            <Alert severity="info">
              <strong>Dispositivo Apple (iOS):</strong> Para recibir notificaciones, primero debes pulsar el botón <em>Compartir</em> en Safari y elegir <strong>"Añadir a pantalla de inicio"</strong>. Luego abre la app desde tu pantalla de inicio y podrás activarlas.
            </Alert>
          ) : permission === "denied" ? (
            <Alert severity="error">
              El permiso de notificaciones fue bloqueado en este navegador. Para recibir alertas debes desbloquearlo en la barra de direcciones o en la configuración del navegador.
            </Alert>
          ) : isSubscribed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <CheckCircleIcon color="success" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Las notificaciones están activadas en este dispositivo.
                </Typography>
              </div>
              <Typography variant="body2" color="text.secondary">
                Recibirás avisos en tiempo real sobre órdenes de mantención, reparaciones y alertas del sistema, incluso si no tienes la aplicación abierta.
              </Typography>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Typography variant="body2" color="text.secondary">
                Activa las notificaciones para estar al día con asignaciones de mantenciones, reparaciones urgentes y estados de clientes.
              </Typography>
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, display: "flex", justifyContent: "space-between", gap: 1 }}>
          {isSubscribed ? (
            <>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleUnsubscribe}
                disabled={actionLoading}
              >
                Desactivar
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleTestNotification}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              >
                Probar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleClose} color="inherit" size="small">
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSubscribe}
                disabled={!isSupported || actionLoading || (isIOS && !isStandalone) || permission === "denied"}
                startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <NotificationsActiveIcon />}
              >
                Activar Notificaciones
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
