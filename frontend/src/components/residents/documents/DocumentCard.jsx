import {
  FileText,
  FileSpreadsheet,
  FileType,
  Download,
  Eye,
  CalendarDays,
  User,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useDocumentStore from "../../../store/documentStore";


const DocumentCard = ({
  document,
  onPreview,
}) => {

  const downloadDocument =
    useDocumentStore(
      (state) =>
        state.downloadDocument
    );


  const getFileIcon = () => {

    switch(document.type) {

      case "PDF":
        return (
          <FileText
            size={32}
            className="text-red-500"
          />
        );

      case "DOCX":
        return (
          <FileType
            size={32}
            className="text-blue-500"
          />
        );

      case "XLSX":
        return (
          <FileSpreadsheet
            size={32}
            className="text-green-500"
          />
        );

      default:
        return (
          <FileText
            size={32}
          />
        );
    }

  };


  const handleDownload = () => {

    downloadDocument(document);

    // Backend download API later
    window.open(
      document.url,
      "_blank"
    );

  };


  return (

    <Card
      className="
      group
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
      "
    >

      <div className="flex items-start justify-between">


        {/* Icon */}

        <div
          className="
          rounded-2xl
          bg-slate-100
          p-4
          "
        >
          {getFileIcon()}
        </div>


        <Badge variant="primary">
          {document.category}
        </Badge>


      </div>



      {/* Content */}


      <div className="mt-5">


        <h2
          className="
          line-clamp-2
          text-xl
          font-bold
          text-slate-800 dark:text-slate-100
          "
        >

          {document.title}

        </h2>


        <p
          className="
          mt-2
          line-clamp-2
          text-sm
          text-slate-500 dark:text-slate-400
          "
        >

          {document.description}

        </p>


      </div>



      {/* Metadata */}


      <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">


        <div className="flex items-center gap-3">

          <CalendarDays size={16}/>

          <span>
            {document.uploadDate}
          </span>

        </div>



        <div className="flex items-center gap-3">

          <User size={16}/>

          <span>
            Uploaded by {document.uploadedBy}
          </span>

        </div>



        <div className="flex justify-between">


          <span>
            Size: {document.size}
          </span>


          <span>
            Downloads:
            {" "}
            {document.downloads}
          </span>


        </div>


      </div>



      {/* Actions */}


      <div
        className="
        mt-6
        flex
        gap-3
        "
      >

        <Button

          variant="outline"

          className="flex-1"

          onClick={() =>
            onPreview(document)
          }

        >

          <Eye size={18}/>

          Preview

        </Button>



        <Button

          className="flex-1"

          onClick={
            handleDownload
          }

        >

          <Download size={18}/>

          Download

        </Button>


      </div>


    </Card>

  );

};


export default DocumentCard;