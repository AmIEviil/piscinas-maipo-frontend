import { useTranslation } from "react-i18next";
import Button from "../ui/button/Button";
import CustomInputText from "../ui/InputText/CustomInputText";
import style from "./BodyLogin.module.css";
import { useState } from "react";
import { type IAuthPayload } from "../../service/authinterface";
import { useLogin } from "../../hooks/LoginHooks";
import { useLoginStore } from "../../store/AuthStore";

const BodyLogin = () => {
  const { t } = useTranslation();
  const setUserData = useLoginStore((state) => state.setUserData);
  const setToken = useLoginStore((state) => state.setToken);

  const loginMutation = useLogin();

  const [credentials, setCredentials] = useState<IAuthPayload>({
    user_name: "",
    password: "",
  });

  const handleInputChange = (value: string, name: keyof IAuthPayload) => {
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      const loginResponse = await loginMutation.mutateAsync(credentials);
      console.log(loginResponse);
      setUserData(loginResponse);
      setToken(loginResponse.accessToken);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className={style.bodyLogin}>
      <div className={style.bodyContent}>
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
          />
          <span className={style.forgotPassword} role="button">
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
