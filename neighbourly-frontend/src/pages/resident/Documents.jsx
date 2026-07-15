import {
  useMemo,
  useState,
} from "react";


import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";


import DocumentStats from "../../components/residents/documents/DocumentStats";
import DocumentFilters from "../../components/residents/documents/DocumentFilters";
import DocumentCard from "../../components/residents/documents/DocumentCard";
import DocumentPreview from "../../components/residents/documents/DocumentPreview";
import RecentDownloads from "../../components/residents/documents/RecentDownloads";


import useDocumentStore from "../../store/documentStore";


const Documents = () => {


  const documents =
    useDocumentStore(
      (state) =>
        state.documents
    );


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    category,
    setCategory,
  ] = useState("");


  const [
    type,
    setType,
  ] = useState("");


  const [
    sort,
    setSort,
  ] = useState("newest");



  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState(null);



  const filteredDocuments =
    useMemo(() => {

      let data =
        [...documents];


      // Search

      if(search.trim()){

        const query =
          search.toLowerCase();


        data =
          data.filter(
            (document) =>
              document.title
              .toLowerCase()
              .includes(query)
          );

      }



      // Category

      if(category){

        data =
          data.filter(
            (document) =>
              document.category === category
          );

      }



      // Type

      if(type){

        data =
          data.filter(
            (document) =>
              document.type === type
          );

      }



      // Sorting

      data.sort(
        (a,b)=>{

          if(
            sort === "downloads"
          ){

            return (
              b.downloads -
              a.downloads
            );

          }


          const first =
            new Date(
              a.uploadDate
            );


          const second =
            new Date(
              b.uploadDate
            );


          return sort === "oldest"
            ? first - second
            : second - first;

        }
      );


      return data;


    },[
      documents,
      search,
      category,
      type,
      sort,
    ]);




  return (

    <Layout

      title="Society Documents"

      breadcrumb={[
        "Resident",
        "Documents",
      ]}

    >


      {/* Stats */}

      <DocumentStats />



      {/* Filters */}

      <DocumentFilters

        search={search}

        setSearch={setSearch}

        category={category}

        setCategory={setCategory}

        type={type}

        setType={setType}

        sort={sort}

        setSort={setSort}

      />



      {/* Documents */}


      <section className="mb-12">


        <div
          className="
          mb-6
          flex
          items-center
          justify-between
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-slate-800
            "
          >

            All Documents

          </h2>


          <span
            className="
            text-sm
            text-slate-500
            "
          >

            {
              filteredDocuments.length
            }
            {" "}
            Files

          </span>


        </div>




        {
          filteredDocuments.length === 0 ?


          (

            <div
              className="
              rounded-2xl
              border-2
              border-dashed
              border-slate-300
              bg-white
              py-20
              text-center
              "
            >

              <h3
                className="
                text-xl
                font-semibold
                "
              >

                No Documents Found

              </h3>


              <p
                className="
                mt-2
                text-slate-500
                "
              >

                Try changing your filters.

              </p>


            </div>

          )


          :


          (

            <div
              className="
              grid
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
              "
            >


              {
                filteredDocuments.map(
                  (document)=>(

                    <DocumentCard

                      key={
                        document.id
                      }

                      document={
                        document
                      }

                      onPreview={
                        setSelectedDocument
                      }

                    />

                  )
                )
              }


            </div>

          )

        }


      </section>




      {/* Recent Downloads */}


      <section>

        <RecentDownloads />

      </section>




      {/* Preview Modal */}


      <DocumentPreview

        document={
          selectedDocument
        }

        onClose={() =>
          setSelectedDocument(null)
        }

      />



    </Layout>

  );

};


export default Documents;