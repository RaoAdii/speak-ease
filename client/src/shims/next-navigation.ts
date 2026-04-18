import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1)
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParamsShim() {
  return useSearchParams();
}

export function useParamsShim() {
  return useParams();
}

export function redirect(to: string) {
  window.location.assign(to);
}
