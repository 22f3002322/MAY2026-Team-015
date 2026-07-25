import {
  FileText,
  Download,
  CalendarDays,
  User,
  HardDrive,
} from "lucide-react";

import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useDocumentStore from "../../../store/documentStore";


const DocumentPreview = ({
  document,
  onClose,
}) => {

  const downloadDocument =
    useDocumentStore(
      (state) =>
        state.downloadDocument
    );


  if (!document) return null;


  const handleDownload = () => {

    downloadDocument(document);

    window.open(
      document.url,
      "_blank"
    );

  };


  return (

    <Modal
      open={!!document}
      title="Document Preview"
      onClose={onClose}
    >

      <div className="space-y-6">


        {/* Header */}


        <div
          className="
          flex
          items-start
          justify-between
          gap-4
          "
        >

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
              bg-red-100
              p-3
              "
            >

              <FileText
                size={32}
                className="text-red-600"
              />

            </div>


            <div>

              <h2
                className="
                text-xl
                font-bold
                text-slate-800
                "
              >
                {document.title}
              </h2>


              <p
                className="
                text-sm
                text-slate-500
                "
              >
                {document.type}
              </p>

            </div>


          </div>


          <Badge variant="primary">

            {document.category}

          </Badge>


        </div>



        {/* Details */}


        <div
          className="
          grid
          gap-5
          rounded-xl
          bg-slate-50
          p-5
          md:grid-cols-2
          "
        >


          <div className="flex gap-3">

            <CalendarDays
              size={18}
              className="text-indigo-600"
            />

            <div>

              <p className="text-xs text-slate-500">
                Uploaded Date
              </p>

              <p className="font-medium">
                {document.uploadDate}
              </p>

            </div>

          </div>



          <div className="flex gap-3">

            <User
              size={18}
              className="text-indigo-600"
            />

            <div>

              <p className="text-xs text-slate-500">
                Uploaded By
              </p>

              <p className="font-medium">
                {document.uploadedBy}
              </p>

            </div>

          </div>



          <div className="flex gap-3">

            <HardDrive
              size={18}
              className="text-indigo-600"
            />

            <div>

              <p className="text-xs text-slate-500">
                File Size
              </p>

              <p className="font-medium">
                {document.size}
              </p>

            </div>

          </div>



          <div className="flex gap-3">

            <Download
              size={18}
              className="text-indigo-600"
            />

            <div>

              <p className="text-xs text-slate-500">
                Downloads
              </p>

              <p className="font-medium">
                {document.downloads}
              </p>

            </div>

          </div>


        </div>



        {/* Description */}


        <div>

          <h3
            className="
            mb-2
            font-semibold
            text-slate-800
            "
          >

            Description

          </h3>


          <p
            className="
            rounded-xl
            bg-slate-50
            p-4
            leading-7
            text-slate-600
            "
          >

            {document.description}

          </p>


        </div>



        {/* Preview Area */}


        <div
          className="
          flex
          h-56
          items-center
          justify-center
          rounded-xl
          border-2
          border-dashed
          border-slate-300
          bg-slate-50
          "
        >

          <div className="text-center">


            <FileText
              size={45}
              className="mx-auto text-slate-400"
            />


            <p className="mt-3 text-sm text-slate-500">

              PDF preview will appear here

            </p>


          </div>


        </div>



        {/* Footer */}


        <div
          className="
          flex
          justify-end
          gap-3
          "
        >

          <Button
            variant="outline"
            onClick={onClose}
          >

            Close

          </Button>


          <Button
            onClick={handleDownload}
          >

            <Download size={18}/>

            Download

          </Button>


        </div>


      </div>


    </Modal>

  );

};


export default DocumentPreview;