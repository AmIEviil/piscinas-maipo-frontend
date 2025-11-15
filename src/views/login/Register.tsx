// import { useState } from "react";
// import Button from "../../components/ui/button/Button";
// import InputText from "../../components/ui/inputs/InputText";
// import "./register.css";
// import LanguageSwitcher from "../../components/ui/languagueSwitch/LanguageSwitcher";
// import { useTranslation } from "react-i18next";
// import InputPassword from "../../components/ui/inputs/InputPassword";
// import { useRegister } from "../../hooks/login/RegisterHooks";
// import { useNavigate, useParams } from "react-router-dom";
// import { useBoundStore } from "../../store/BoundedStore";
// import LoadingSpinner from "../../components/ui/loading/Loading";
// import { hasUpperCase, numbersInString } from "../../utils/RegisterUtils";
// import { PasswordRules } from "./components/PasswordRules";
// import { PDCHeaderIcon } from "../../components/ui/icons/PdcHeaderIcon";
// import { PAGE_ROUTES } from "../../constants/routes";
// import CardGF from "../../components/ui/goldfields/CardGF";
// import i18n from "../../i18n";

// export const RegisterUser = () => {
//   const [nombreUsuario, setNombreUsuario] = useState<string | undefined>(
//     undefined
//   );
//   const [password, setPassword] = useState<string>("");
//   const [repeatedPassword, setReapetedPassword] = useState<string>("");

//   const navigate = useNavigate();

//   const { t } = useTranslation();

//   const params = useParams();

//   const setNombreValue = (value: string | number) => {
//     setNombreUsuario(typeof value === "number" ? value.toString() : value);
//   };
//   const setPasswordValue = (value: string) => {
//     setPassword(value);
//   };
//   const setReapeatedPasswordValue = (value: string) => {
//     setReapetedPassword(value);
//   };

//   const registerMutation = useRegister();

//   const setToken = useBoundStore((state) => state.setToken);

//   const validatePasswords = (passOne: string, passTwo: string) =>
//     passOne === passTwo &&
//     password.length >= 8 &&
//     hasUpperCase(password) &&
//     numbersInString(password);

//   const handleRegister = () => {
//     registerMutation
//       .mutateAsync({
//         data: {
//           password: password,
//           user_name: nombreUsuario as string,
//           language: i18n.language as "es" | "en",
//         },
//         params: { token: params.token },
//       })
//       .then((result) => {
//         setToken(result.token);
//       })
//       .catch((error) => {
//         console.error("error", error);

//         navigate(PAGE_ROUTES.Error);
//       })
//       .finally(() => navigate("/"));
//   };

//   // registerMutation.isSuccess &&

//   if (registerMutation.isPending || registerMutation.isSuccess)
//     return (
//       <div className="register-container flex justify-center w-dvw h-dvh z-50 bg-white">
//         <LoadingSpinner testId="loading-spinner"></LoadingSpinner>
//       </div>
//     );
//   return (
//     <div
//       className="register-container flex justify-center w-dvw h-dvh"
//       style={
//         {
//           // mixBlendMode: "plus-darker",
//         }
//       }
//     >
//       <div className="grid grid-cols-5 h-full w-full z-30 max-lg:flex max-lg:flex-col ">
//         <div className="col-span-2 pt-[10dvh] px-[10dvw] w-full flex justify-center max-lg:col-span-[none]">
//           <PDCHeaderIcon
//             width="min(25dvw, 250px)"
//             height="min(10dvh, 75px)"
//           ></PDCHeaderIcon>
//         </div>
//         <div className="col-span-3 z-[1000] bg-white overflow-auto w-full register-form-container">
//           <div className="title-container">
//             <h1 className="register-title container text-[24px]">
//               {t("modules.login.welcome")}{" "}
//               <span className="pdc-label">PDC</span>
//             </h1>
//             <div className="register-subtitle text-[16px]">
//               {t("modules.login.create_account")}
//             </div>
//           </div>
//           <div className="flex justify-center flex-wrap mt-[56px]">
//             <div className="flex flex-wrap flex-col items-center w-[449px] gap-3 text-left">
//               <InputText
//                 showTitle
//                 testId="username-input"
//                 title={t("modules.login.form.username")}
//                 showInfoIcon={false}
//                 showCircleIcons={false}
//                 showCaption={false}
//                 onChange={setNombreValue}
//                 disabled={false}
//                 align="left"
//               />
//               <InputPassword
//                 testId="password-input"
//                 title={t("modules.login.form.password")}
//                 showCaption={false}
//                 onChange={setPasswordValue}
//                 disabled={false}
//               />
//               <PasswordRules password={password} />
//               <InputPassword
//                 title={t("modules.login.form.repeat_password")}
//                 testId="repeat-password-input"
//                 showCaption={false}
//                 onChange={setReapeatedPasswordValue}
//                 disabled={!validatePasswords(password, password)}
//               />
//               <div className="w-full flex justify-center">
//                 <Button
//                   testId="register-button"
//                   className="w-full text-center"
//                   labelClassName="w-full text-center"
//                   disabled={!validatePasswords(password, repeatedPassword)}
//                   label={t("modules.common.register")}
//                   onClick={handleRegister}
//                 ></Button>
//               </div>
//               {registerMutation.error && t("modules.error.register_error")}
//               <div className="flex justify-center w-full">
//                 <LanguageSwitcher />
//               </div>
//             </div>
//           </div>
//           <CardGF position="left" />
//         </div>
//       </div>
//     </div>
//   );
// };
