"use client";

import * as React from "react";

const DndActiveContext = React.createContext(false);

export function useDndActive() {
  return React.useContext(DndActiveContext);
}

export { DndActiveContext };
