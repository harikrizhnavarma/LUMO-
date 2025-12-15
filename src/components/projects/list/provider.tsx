/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAppDispatch } from "@/redux/store";
import { fetchProjectsSuccess } from "@/redux/slice/projects";
import type { BrandWithKit } from "@/types/brandKit";

interface ProjectsProviderProps {
  children: ReactNode;
  initialProjects: any;      // preloadQuery result with _valueJSON
  initialBrands?: any;       // keep this loose to accept Preloaded<...> | null
}

type BrandContextValue = {
  brands: BrandWithKit[] | null;
  setBrands: React.Dispatch<React.SetStateAction<BrandWithKit[] | null>>;
};

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export const useBrandsContext = (): BrandContextValue => {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    throw new Error("useBrandsContext must be used within a ProjectsProvider");
  }
  return ctx;
};

export const ProjectsProvider = ({
  children,
  initialProjects,
  initialBrands,
}: ProjectsProviderProps) => {
  const dispatch = useAppDispatch();

  // Cast just the internal value to BrandWithKit[], keep the prop type loose
  const [brands, setBrands] = useState<BrandWithKit[] | null>(
    (initialBrands?._valueJSON as BrandWithKit[] | undefined) ?? null
  );

  useEffect(() => {
    // Initialize Redux state with SSR data
    if (initialProjects?._valueJSON) {
      const projectsData = initialProjects._valueJSON;
      dispatch(
        fetchProjectsSuccess({
          projects: projectsData,
          total: projectsData.length,
        })
      );
    }
  }, [dispatch, initialProjects]);

  return (
    <BrandContext.Provider value={{ brands, setBrands }}>
      {children}
    </BrandContext.Provider>
  );
};
