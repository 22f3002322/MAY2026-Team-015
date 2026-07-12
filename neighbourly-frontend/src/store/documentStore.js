import { create } from "zustand";
import { documents as initialDocuments } from "../mock/documents";

const useDocumentStore = create((set) => ({
  documents: initialDocuments,

  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  updateDocument: (id, updatedDocument) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? updatedDocument : doc
      ),
    })),

  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter(
        (doc) => doc.id !== id
      ),
    })),
}));

export default useDocumentStore;