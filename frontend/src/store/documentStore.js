import { create } from "zustand";
import { persist } from "zustand/middleware";

import { documents as initialDocuments } from "../mock/documents";


const useDocumentStore = create(

    persist(

        (set) => ({

            documents: initialDocuments,


            recentDownloads: [],



            // ADMIN: Upload document

            addDocument: (document) =>

                set((state) => ({

                    documents: [
                        ...state.documents,

                        {
                            ...document,

                            id:
                                document.id ||
                                crypto.randomUUID(),

                            downloads: 0,

                            status:
                                document.status ||
                                "Published",

                            createdAt:
                                new Date().toISOString(),

                        }

                    ]

                })),




            // ADMIN: Update document

            updateDocument: (id, data) =>

                set((state) => ({

                    documents:

                        state.documents.map(
                            (doc) =>

                                doc.id === id

                                    ?

                                    {
                                        ...doc,
                                        ...data
                                    }

                                    :

                                    doc

                        )

                })),





            // ADMIN: Delete document

            deleteDocument: (id) =>

                set((state) => ({

                    documents:

                        state.documents.filter(
                            (doc) =>
                                doc.id !== id
                        )

                })),






            // RESIDENT: Download

            downloadDocument: (document) =>

                set((state) => {


                    const updatedDocs =

                        state.documents.map(
                            (doc) =>

                                doc.id === document.id

                                    ?

                                    {

                                        ...doc,

                                        downloads:
                                            (doc.downloads || 0) + 1

                                    }

                                    :

                                    doc

                        );



                    return {


                        documents:
                            updatedDocs,


                        recentDownloads:

                            [
                                {
                                    ...document,

                                    downloadedAt:
                                        new Date()
                                            .toISOString()

                                },

                                ...state.recentDownloads
                                    .filter(
                                        (item) =>
                                            item.id !== document.id
                                    )

                            ].slice(0, 10)


                    };


                }),




            // Clear history

            clearDownloads: () =>

                set({

                    recentDownloads: []

                }),





            // ADMIN: Publish document

            publishDocument: (id) =>

                set((state) => ({

                    documents:

                        state.documents.map(
                            (doc) =>

                                doc.id === id

                                    ?

                                    {
                                        ...doc,
                                        status: "Published"
                                    }

                                    :

                                    doc

                        )

                })),





            // ADMIN: Archive document

            archiveDocument: (id) =>

                set((state) => ({

                    documents:

                        state.documents.map(
                            (doc) =>

                                doc.id === id

                                    ?

                                    {
                                        ...doc,
                                        status: "Archived"
                                    }

                                    :

                                    doc

                        )

                })),





            resetDocuments: () => set({

                documents:
                    initialDocuments,

                recentDownloads: []

            })

        }),


        {
            name: "document-storage"
        }

    )

);


export default useDocumentStore;