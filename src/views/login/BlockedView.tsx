import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@mui/material";
import ErrorIconV2 from "../../components/ui/Icons/ErrorIconV2";

export const BlockedView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center h-[100vh] max-w-[709px] mx-auto">
      <div className="flex flex-col justify-center items-center text-center">
        <ErrorIconV2 color="#DF5475" size={48} className="mb-10" />
        <b className="max-w-[445px] mb-6 text-2xl">
          {t("modules.login.blocked.user_blocked")}
        </b>
        <span className="text-base">
          {t("modules.login.blocked.contact_admin")}
          <p className="text-blue-500">{t("modules.recover.email_example")}</p>
        </span>
        <Button
          onClick={() => navigate("/login")}
          title={t("modules.login.blocked.back_to_login")}
        />
      </div>
    </div>
  );
};
