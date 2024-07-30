// types/translations.d.ts
export interface Translations {
  NotFound: {
    title: string;
    description: string;
  };
  index: {
    title: string;
  };
  navbar: {
    title: string;
  };
  TrainingIBMPage: {
    title: string;
    subtitle: string;
    description: string;
    button: string;
  };
  Metadata: {
    title: string;
    description: string;
    trainingIBMTitle: string;
    trainingIBMDescription: string;
    contactTitle: string;
    contactDescription: string;
  };
  PageCreator: {
    title: string;
    published: string;
    draft: string;
    pageNotEditableMessage: string;
    actions: {
      createNewPage: string;
      createSubpage: string;
      editPage: string;
      createPage: string;
      updatePage: string;
      deletePage: string;
      cancel: string;
      confirmDelete: string;
      edit: string;
      delete: string;
      view: string;
      editContent: string;
    };
    search: {
      searchPages: string;
      filterByStatus: string;
      allPages: string;
      publishedOnly: string;
    };
    table: {
      title: string;
      author: string;
      status: string;
      lastModified: string;
      actions: string;
    };
    messages: {
      loading: string;
      saving: string;
      pagesLoadedSuccess: string;
      errorLoadingPages: string;
      deleteSuccess: string;
      deleteError: string;
    };
    deleteDialog: {
      deletePageWithChildren: string;
      deletePageConfirmation: string;
      deletePageWithChildrenDescription: string;
      deleteCascade: string;
      deleteMoveUp: string;
    };
    form: {
      titleLabel: string;
      titlePlaceholder: string;
      contentLabel: string;
      contentPlaceholder: string;
      slugLabel: string;
      slugPlaceholder: string;
      langLabel: string;
      langPlaceholder: string;
      parentPageLabel: string;
      selectParentPage: string;
      noParent: string;
      publishLabel: string;
      publishDescription: string;
      authorLabel: string;
      authorPlaceholder: string;
      updateSuccessDescription: string;
      createSuccessDescription: string;
      errorMessage: string;
      templateLabel: string;
      selectTemplate: string;
      templateDescription: string;
      fullPathLabel: string;
      fullPathPlaceholder: string;
      fullPathDuplicateError: string;
      fullPathUpdateError: string;
    };
    errors: {
      createPageError: string;
      updatePageError: string;
      duplicateFullPath: string;
    };
  };
}

export type TranslationKeys<T> = keyof T;
