"use client";

import { useEffect } from "react";

export function CiCheck() {
  useEffect(() => {
    console.info("CI WORKS");
  }, []);

  return null;
}
