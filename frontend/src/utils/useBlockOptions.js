/** Shared live block options for Admin filters/forms. */
import { useEffect } from "react";
import useApartmentStore from "../store/apartmentStore";
import { blockOptions } from "./adminMaps";

export function useBlockOptions() {
  const blocks = useApartmentStore((s) => s.blocks);
  const fetchBlocks = useApartmentStore((s) => s.fetchBlocks);

  useEffect(() => {
    if (!blocks?.length) fetchBlocks();
  }, [blocks?.length, fetchBlocks]);

  return blockOptions(blocks);
}
