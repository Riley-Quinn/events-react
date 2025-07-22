/* eslint-disable react/prop-types */
import React, { createContext, useContext, useEffect, useState } from "react";
import { createMongoAbility } from "@casl/ability";

export const AbilityContext = createContext();
export const ability = createMongoAbility();

export function AbilityProvider({ permissions, children }) {
  const [caslAbility] = useState(() => ability);

  useEffect(() => {
    caslAbility.update(permissions);
  }, [permissions]);

  return <AbilityContext.Provider value={caslAbility}>{children}</AbilityContext.Provider>;
}

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used within AbilityProvider");
  }
  return ability;
}
