import { Toaster } from "sonner";
import { useTheme } from "../context/ThemeContext";

export function ThemeToaster() {
    const { theme } = useTheme();
    
    return <Toaster position="top-center" richColors theme={theme} />;
}
