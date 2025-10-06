import { FormEvent, useEffect, useState } from "react";
import FieldInput from "@/components/form/field-input";
import StatusTags from "@/components/status-tags";
import { EyeIcon } from "@/icons/icons"
import { showToast } from "@/components/toast";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { supabase } from "@/api/supabase-client";
import { UAParser } from 'ua-parser-js'
import { useGeneralInformation } from "@/api/general-provider"

export default function Login() {
  const navigate = useNavigate();
  const { companyName } = useGeneralInformation()
  const [isPassword, setIsPassword] = useState(true);
  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = user;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast(error.message, false);
    } else {
      handleSubmitLoginHistory(data.user.id);
    }
  }

  const handleSubmitLoginHistory = async (userId: string) => {
    const parser = new UAParser();
    const result = parser.getResult();
    const res = await fetch("https://ipapi.co/json/");
    const dataLocation = await res.json();
    const resIp = await fetch("https://ipv4.icanhazip.com");
    const ip = (await resIp.text()).trim();

    const loginInfo = { browser: `${result.browser.name} ${result.browser.version}`, os: `${result.os.name} ${result.os.version}`, isp: dataLocation.org, location: `${dataLocation.city}, ${dataLocation.region}, ${dataLocation.country_name}`, ip }
    const { error } = await supabase.from('loginHistory').insert({
      userId,
      ip: loginInfo.ip,
      os: loginInfo.os,
      isp: loginInfo.isp,
      location: loginInfo.location,
      browser: loginInfo.browser
    })

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast('Sesión iniciada', true);
    navigate("/");
  }

  function handleChangeUser(name: keyof typeof user, value: string) {
    setUser({ ...user, [name]: value });
  }


  return (
    <>
      <Toaster />
      <div className="h-screen w-screen py-0 flex items-center justify-center">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <section className="text-primary sm:w-[450px] sm:h-auto size-full p-8 rounded-lg bg-white">
          <header className="flex items-center justify-between">
            <h1 className="text-primary font-bold text-xl">{companyName}</h1>
            <StatusTags text="Administrativo" status />
          </header>

          <main className="mt-10">
            <h2 className="text-primary text-2xl font-semibold">Hola, bienvenido</h2>
            <p className="font-medium text-whiting">Inicia sesión para poder acceder al sistema</p>

            <form onSubmit={handleSubmit} className="mt-3">
              <FieldInput
                classNameDiv="h-10"
                onChange={(e) => handleChangeUser("email", e.target.value)}
                className="mt-8"
                autofocus
                name="Correo electrónico"
                id="email"
              />

              <FieldInput
                classNameDiv="h-10"
                onChange={(e) => handleChangeUser("password", e.target.value)}
                className="mt-3"
                name="Contraseña"
                id="password"
                type={isPassword ? "password" : "text"}
                prependChild={
                  <button type="button" onClick={() => setIsPassword(!isPassword)}>
                    <EyeIcon className="size-5 fill-secondary/80" />
                  </button>
                }
              />

              <button type="submit" className="bg-primary rounded-lg text-white shadow-lg text-[15px] w-full mt-8 py-3 border-gray-300 border">
                Iniciar sesión
              </button>

              <div className="w-full text-center mt-5">
                <span className="text-seconda font-semibold text-sm inline-block">
                  ¿Has olvidado tu contraseña? <span className="text-[#005bd3] cursor-pointer hover:underline">Cámbiala</span>
                </span>
              </div>
            </form>
          </main>
        </section>
      </div>
    </>
  );
}