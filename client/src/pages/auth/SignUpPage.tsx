import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "./AuthForm";

export function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  return (
    <AuthForm
      mode="sign-up"
      onSubmit={async (values) => {
        await register({
          name: values.name || "",
          email: values.email,
          password: values.password
        });
        navigate("/courses");
      }}
    />
  );
}
