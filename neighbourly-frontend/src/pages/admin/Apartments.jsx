import { useState } from "react";

import Layout from "../../components/layout/Layout";

import ApartmentStats from "../../components/apartments/ApartmentStat";
import ApartmentFilters from "../../components/apartments/ApartmentFilters";

const Apartments = () => {
  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");

  return (
    <Layout
      title="Apartments"
      breadcrumb={["Home", "Apartments"]}
    >
      <ApartmentStats />

      <ApartmentFilters
        search={search}
        setSearch={setSearch}
        block={block}
        setBlock={setBlock}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
        onAddApartment={() =>
          console.log("Open Add Apartment Modal")
        }
      />
    </Layout>
  );
};

export default Apartments;