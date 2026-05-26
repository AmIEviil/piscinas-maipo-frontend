import { useTranslation } from "react-i18next";
import Button from "../ui/button/Button";
import CustomInputText from "../ui/InputText/CustomInputText";
import style from "./BodyLogin.module.css";
import { useState } from "react";
import { type IAuthPayload } from "../../service/auth.interface";
import { useLogin, useRequestPasswordReset } from "../../hooks/LoginHooks";
import { useBoundStore } from "../../store/BoundedStore";
import { useNavigate } from "react-router";

type LoginStep = "login" | "forgot" | "forgot-success";

const BodyLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setUserData = useBoundStore((state) => state.setUserData);
  const setToken = useBoundStore((state) => state.setToken);

  const loginMutation = useLogin();
  const requestResetMutation = useRequestPasswordReset();

  const [step, setStep] = useState<LoginStep>("login");
  const [error, setError] = useState<string | null>(null);

  const [credentials, setCredentials] = useState<IAuthPayload>({
    user_name: "",
    password: "",
  });

  const [forgotFields, setForgotFields] = useState({
    user_name: "",
    email: "",
  });

  const handleInputChange = (value: string, name: keyof IAuthPayload) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotChange = (value: string, name: "user_name" | "email") => {
    setForgotFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setError(null);
    try {
      const loginResponse = await loginMutation.mutateAsync(credentials);
      setUserData(loginResponse);
      setToken(loginResponse.accessToken);
      navigate("/");
    } catch (err) {
      setError(
        (err as unknown as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "An error occurred during login."
      );
    }
  };

  const handleRequestReset = async () => {
    setError(null);
    try {
      await requestResetMutation.mutateAsync(forgotFields);
      setStep("forgot-success");
    } catch (err) {
      const msg = (
        err as unknown as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      if (msg === "user_or_email_not_found") {
        setError(t("modules.login.forgot_password.error_not_found"));
      } else if (msg === "user_blocked") {
        setError(t("modules.login.forgot_password.error_blocked"));
      } else {
        setError(t("modules.login.forgot_password.error_generic"));
      }
    }
  };

  if (step === "forgot-success") {
    return (
      <div className={style.bodyLogin}>
        <div className={style.bodyContent}>
          <h3 className="text-center font-semibold text-lg">
            {t("modules.login.forgot_password.success_title")}
          </h3>
          <p className="text-center text-sm mt-2 text-gray-600">
            {t("modules.login.forgot_password.success_message")}
          </p>
          <div className="flex flex-col gap-4 mt-6 text-center">
            <Button
              type="button"
              className="w-full text-center"
              labelClassName="w-full text-center"
              label={t("modules.login.forgot_password.back_to_login")}
              onClick={() => {
                setStep("login");
                setError(null);
                setForgotFields({ user_name: "", email: "" });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "forgot") {
    return (
      <div className={style.bodyLogin}>
        <div className={style.bodyContent}>
          <h3 className="text-center font-semibold text-lg mb-2">
            {t("modules.login.forgot_password.title")}
          </h3>
          {error && <span className={style.errorMessage}>{error}</span>}
          <CustomInputText
            title={t("modules.login.forgot_password.username_label")}
            require={false}
            customClassTitle="text-center!"
            customClass="w-[300px]!"
            value={forgotFields.user_name}
            onChange={(value) => handleForgotChange(value, "user_name")}
          />
          <CustomInputText
            title={t("modules.login.forgot_password.email_label")}
            type="email"
            require={false}
            customClassTitle="text-center!"
            customClass="w-[300px]!"
            value={forgotFields.email}
            onChange={(value) => handleForgotChange(value, "email")}
          />
          <div className="flex flex-col gap-4 mt-6 text-center">
            <Button
              type="submit"
              className="w-full text-center"
              labelClassName="w-full text-center"
              label={t("modules.login.forgot_password.submit")}
              onClick={handleRequestReset}
              disabled={requestResetMutation.isPending}
            />
            <span
              className={style.forgotPassword}
              role="button"
              onClick={() => {
                setStep("login");
                setError(null);
              }}
            >
              {t("modules.login.forgot_password.back_to_login")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.bodyLogin}>
      <div className={style.bodyContent}>
        {error && <span className={style.errorMessage}>{error}</span>}
        <CustomInputText
          title="Usuario"
          require={false}
          customClassTitle="text-center!"
          customClass="w-[300px]!"
          value={credentials.user_name}
          onChange={(value) => handleInputChange(value, "user_name")}
        />
        <CustomInputText
          title="Contraseña"
          type="password"
          require={false}
          customClassTitle="text-center!"
          customClass="w-[300px]!"
          value={credentials.password}
          onChange={(value) => handleInputChange(value, "password")}
        />
        <div className="flex flex-col gap-4 mt-6 text-center">
          <Button
            type="submit"
            className="w-full text-center"
            labelClassName="w-full text-center"
            label={t("modules.login.form.login")}
            onClick={handleLogin}
            disabled={loginMutation.isPending}
          />
          <span
            className={style.forgotPassword}
            role="button"
            onClick={() => {
              setStep("forgot");
              setError(null);
            }}
          >
            {t("modules.login.form.forgot_your_password")}
          </span>
          <span className={style.signUp} role="button">
            {t("modules.login.form.sign_in")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BodyLogin;
