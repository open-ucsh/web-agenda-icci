import { useEffect, useState } from "react";

export type AppView = "agenda" | "curriculum" | "planner";

function readAppView(): AppView {
  switch (window.location.hash) {
    case "#malla":
      return "curriculum";
    case "#semestre":
      return "planner";
    default:
      return "agenda";
  }
}

export function useAppView(): AppView {
  const [view, setView] = useState<AppView>(readAppView);

  useEffect(() => {
    function handleHashChange(): void {
      setView(readAppView());
    }

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return view;
}
