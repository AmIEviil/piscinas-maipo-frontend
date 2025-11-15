import CheckIcon from "../../../components/ui/Icons/CheckIcon";
import { useEffect, useState } from "react";
import { hasUpperCase, numbersInString } from "../../../utils/RegisterUtils";
import { useTranslation } from "react-i18next";

interface Props {
  password: string;
}

export const PasswordRules = ({ password }: Props) => {
  const [initialized, setInitialized] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    !initialized && password.length > 0 && setInitialized(true);
  }, [password]);
  return (
    <div className="requisitos-container w-full border-1 border-[#D1D1D1] p-2 rounded-lg bg-[#F7F7F7]">
      <span className="requisitos-title font-bold">
        {t("modules.login.password_rules.title")}
      </span>
      <ul className="list-disc list-outside centered-list [&>li::marker]:text-[8px] [&>li::marker]:text-black">
        <li
          className={`requisitos-list-item marker:p-1  ${
            password.length < 8 &&
            initialized &&
            "[&::marker]:text-[var(--Red-600_cta,#CD0044)_!important] "
          }`}
        >
          <div
            className={`flex gap-x-3 ${
              password.length < 8 &&
              initialized &&
              "text-[var(--Red-600_cta,#CD0044)_!important] "
            }`}
          >
            {t("modules.login.password_rules.length")}
            <span className="mt-0.5">
              {password.length >= 8 && initialized && <CheckIcon size={16} />}
            </span>
          </div>
        </li>
        <li
          className={`requisitos-list-item ${
            !hasUpperCase(password) &&
            initialized &&
            "[&::marker]:text-[var(--Red-600_cta,#CD0044)_!important] "
          }`}
        >
          <div
            className={`flex gap-x-3 ${
              !hasUpperCase(password) &&
              initialized &&
              "text-[var(--Red-600_cta,#CD0044)_!important] "
            }`}
          >
            {t("modules.login.password_rules.uppercase")}
            <span className="mt-0.5">
              {hasUpperCase(password) && initialized && <CheckIcon size={16} />}
            </span>
          </div>
        </li>
        <li
          className={`requisitos-list-item ${
            !numbersInString(password) &&
            initialized &&
            "[&::marker]:text-[var(--Red-600_cta,#CD0044)_!important] "
          }`}
        >
          <div
            className={`flex gap-x-3 ${
              !numbersInString(password) &&
              initialized &&
              "text-[var(--Red-600_cta,#CD0044)_!important] "
            }`}
          >
            {t("modules.login.password_rules.number")}
            <span className="mt-0.5">
              {numbersInString(password) && initialized && (
                <CheckIcon size={16} />
              )}
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
};
