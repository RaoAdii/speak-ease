import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "./AuthForm";
export function SignInPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    return (<AuthForm mode="sign-in" onSubmit={async (values) => {
            await login({
                email: values.email,
                password: values.password
            });
            navigate("/learn");
        }}/>);
}
