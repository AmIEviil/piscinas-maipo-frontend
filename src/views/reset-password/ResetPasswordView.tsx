import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import Button from "../../components/ui/button/Button";
import CustomInputText from "../../components/ui/InputText/CustomInputText";
import HeaderLogin from "../../components/login/HeaderLogin";
import bodyStyle from "../../components/login/BodyLogin.module.css";
import { useResetPassword } from "../../hooks/LoginHooks";
import { useBoundStore } from "../../store/BoundedStore";
import "../login/login.css";

export const ResetPasswordView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const resetMutation = useResetPassword();
  const setUserData = useBoundStore((state) => state.setUserData);
  const setToken = useBoundStore((state) => state.setToken);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("modules.login.reset_password.passwords_mismatch"));
      return;
    }

    try {
      const result = await resetMutation.mutateAsync({ token, newPassword });
      setSuccess(true);
      setToken(result.token);
      localStorage.setItem("refreshToken", result.refreshToken);
      setUserData(result.user);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const msg = (
        err as unknown as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      if (
        msg === "Token inválido o expirado" ||
        msg?.includes("expirado") ||
        msg?.includes("inválido")
      ) {
        setError(t("modules.login.reset_password.token_invalid"));
      } else {
        setError(msg ?? t("modules.login.reset_password.token_invalid"));
      }
    }
  };

  return (
    <div className="flex justify-center w-dvw h-dvh">
      <div className="background-container w-dvw h-dvh">
        <div className="loginView">
          <HeaderLogin />
          <div className={bodyStyle.bodyLogin}>
            <div className={bodyStyle.bodyContent}>
              {error && (
                <span className={bodyStyle.errorMessage}>{error}</span>
              )}
              {success ? (
                <p className="text-center text-sm py-2">
                  {t("modules.login.reset_password.success")}
                </p>
              ) : (
                <>
                  <p className="text-center text-sm pb-2" style={{ color: "var(--color-gris-medio)" }}>
                    {t("modules.login.reset_password.password_requirements")}
                  </p>
                  <CustomInputText
                    title={t("modules.login.reset_password.new_password_label")}
                    type="password"
                    require={false}
                    customClassTitle="text-center!"
                    customClass="w-[300px]!"
                    value={newPassword}
                    onChange={setNewPassword}
                  />
                  <CustomInputText
                    title={t("modules.login.reset_password.confirm_password_label")}
                    type="password"
                    require={false}
                    customClassTitle="text-center!"
                    customClass="w-[300px]!"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                  <div className="flex flex-col gap-4 mt-6 text-center w-full">
                    <Button
                      type="submit"
                      className="w-full text-center"
                      labelClassName="w-full text-center"
                      label={t("modules.login.reset_password.submit")}
                      onClick={handleSubmit}
                      disabled={
                        resetMutation.isPending || !newPassword || !confirmPassword
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
