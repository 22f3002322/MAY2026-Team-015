import { useState } from "react";

import Layout from "../../components/layout/Layout";
import ResidentFilters from "../../components/residents/ResidentFilters";
import ResidentTable from "../../components/residents/ResidentTable";

import { residents } from "../../mock/residents";

const Residents = () => {
  const [search, setSearch] = useState("");

  const filteredResidents = residents.filter((resident) =>
    resident.name.toLowerCase().includes(search.toLowerCase()) ||
    resident.flat.toLowerCase().includes(search.toLowerCase()) ||
    resident.phone.includes(search)
  );

  return (
    <Layout
      title="Residents"
      breadcrumb={["Home", "Residents"]}
    >
      <ResidentFilters
        search={search}
        setSearch={setSearch}
      />

      <ResidentTable
        residents={filteredResidents}
      />
    </Layout>
  );
};

export default Residents;