import { useEffect, useState } from "react";

export type AppView = "agenda" | "curriculum";

function readAppView(): AppView {
  return window.location.hash === "#malla" ? "curriculum" : "agenda";
}

export function useAppView(): AppView {
  const [view, setView] = useState<AppView>(readAppView);

  useEffect(() => {
    function handleHashChange(): void {
      setView(readAppView());
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return view;
}
