import {
  FileText,
  Download,
  Clock3,
  Trash2,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useDocumentStore from "../../../store/documentStore";


const RecentDownloads = () => {

  const recentDownloads =
    useDocumentStore(
      (state) =>
        state.recentDownloads
    );


  const clearDownloads =
    useDocumentStore(
      (state) =>
        state.clearDownloads
    );


  const downloadDocument =
    useDocumentStore(
      (state) =>
        state.downloadDocument
    );


  if (
    recentDownloads.length === 0
  ) {

    return (

      <Card className="py-14">

        <div className="text-center">

          <FileText
            size={45}
            className="mx-auto text-slate-400"
          />


          <h3 className="mt-4 text-xl font-semibold text-slate-800">

            No Recent Downloads

          </h3>


          <p className="mt-2 text-slate-500">

            Downloaded documents will appear here.

          </p>

        </div>

      </Card>

    );

  }


  return (

    <Card className="p-6">

      {/* Header */}

      <div
        className="
        mb-6
        flex
        items-center
        justify-between
        "
      >

        <div>

          <h2
            className="
            text-xl
            font-bold
            text-slate-800
            dark:text-slate-100
            "
          >

            Recent Downloads

          </h2>


          <p
            className="
            mt-1
            text-sm
            text-slate-500
            dark:text-slate-100
            "
          >

            Recently accessed documents

          </p>

        </div>


        <Button
          variant="danger"
          onClick={
            clearDownloads
          }
        >

          <Trash2 size={18}/>

          Clear

        </Button>


      </div>



      {/* List */}


      <div className="space-y-4">


        {recentDownloads.map(
          (document) => (

            <div

              key={document.id}

              className="
              flex
              flex-col
              gap-4
              rounded-xl
              border
              border-slate-200
              p-4
              md:flex-row
              md:items-center
              md:justify-between
              "

            >


              {/* Info */}


              <div
                className="
                flex
                items-center
                gap-4
                "
              >

                <div
                  className="
                  rounded-xl
                  bg-slate-100
                  p-3
                  "
                >

                  <FileText
                    size={24}
                    className="text-red-500"
                  />

                </div>


                <div>


                  <h3
                    className="
                    font-semibold
                    text-slate-800
                    dark:text-slate-100
                    "
                  >

                    {document.title}

                  </h3>


                  <div
                    className="
                    mt-2
                    flex
                    flex-wrap
                    gap-3
                    text-sm
                    text-slate-500
                    "
                  >

                    <Badge variant="primary">

                      {document.type}

                    </Badge>


                    <span>
                      {document.category}
                    </span>


                    <span
                      className="
                      flex
                      items-center
                      gap-1
                      "
                    >

                      <Clock3 size={14}/>

                      {
                        new Date(
                          document.downloadedAt
                        )
                        .toLocaleDateString()
                      }

                    </span>


                  </div>


                </div>


              </div>



              {/* Action */}


              <Button

                variant="outline"

                onClick={() =>
                  downloadDocument(
                    document
                  )
                }

              >

                <Download size={18}/>

                Download Again

              </Button>


            </div>

          )
        )}

      </div>


    </Card>

  );

};


export default RecentDownloads;