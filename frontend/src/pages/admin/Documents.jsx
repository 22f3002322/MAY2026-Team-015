import { useState } from "react";

import Layout from "../../components/layout/Layout";

import DocumentStats from "../../components/documents/DocumentStats";
import DocumentFilters from "../../components/documents/DocumentFilters";
import DocumentTable from "../../components/documents/DocumentTable";
import UploadDocumentForm from "../../components/documents/UploadDocumentForm";
import DocumentDetails from "../../components/documents/DocumentDetails";
import CategoryChart from "../../components/documents/CategoryChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useDocumentStore from "../../store/documentStore";

const Documents = () => {
  // Zustand

  const documents = useDocumentStore(
    (state) => state.documents
  );

  const deleteDocumentById = useDocumentStore(
    (state) => state.deleteDocument
  );

  // Filters

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("");

  const [type, setType] = useState("");

  // CRUD

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [editingDocument, setEditingDocument] =
    useState(null);

  const [deleteDocument, setDeleteDocument] =
    useState(null);

  // Filter Documents

  const filteredDocuments = documents.filter(
    (doc) => {
      const matchesSearch =
        doc.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        doc.documentId
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "" ||
        doc.category === category;

      const matchesType =
        type === "" ||
        doc.type === type;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType
      );
    }
  );

  return (
    <Layout
      title="Documents"
      breadcrumb={["Home", "Documents"]}
    >
      <DocumentStats />

      <div className="mb-6">
        <CategoryChart />
      </div>

      <DocumentFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        type={type}
        setType={setType}
        onUpload={() => {
          setEditingDocument(null);
          setOpenModal(true);
        }}
      />

      <DocumentTable
        documents={filteredDocuments}
        onView={setSelectedDocument}
        onEdit={(doc) => {
          setEditingDocument(doc);
          setOpenModal(true);
        }}
        onDelete={setDeleteDocument}
      />

      {/* Upload / Edit */}

      <Modal
        open={openModal}
        title={
          editingDocument
            ? "Edit Document"
            : "Upload Document"
        }
        onClose={() => {
          setOpenModal(false);
          setEditingDocument(null);
        }}
      >
        <UploadDocumentForm
          initialData={editingDocument}
          onClose={() => {
            setOpenModal(false);
            setEditingDocument(null);
          }}
        />
      </Modal>

      {/* Details */}

      <DocumentDetails
        document={selectedDocument}
        onClose={() =>
          setSelectedDocument(null)
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteDocument}
        title="Delete Document"
        message={`Delete "${deleteDocument?.title}"?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteDocument(null)
        }
        onConfirm={() => {
          deleteDocumentById(deleteDocument.id);

          setDeleteDocument(null);
        }}
      />
    </Layout>
  );
};

export default Documents;