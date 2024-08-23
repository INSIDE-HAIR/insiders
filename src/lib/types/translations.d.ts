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
  Common: {
    pagination: {
      previous: string;
      next: string;
      morePages: string;
    };
    general: {
      loading: string;
      pageNotFound: string;
      currentLanguage: string;
      home: string;
      contact: string;
      about: string;
      services: string;
      welcome: string;
      logout: string;
      loadingError: string;
    };
    errorMessages: {
      loadingError: string;
    };
    columns: {
      id: string;
      data: string;
      select: string;
      all: string;
      createdAt: string;
      updatedAt: string;
      contacts: string;
      month: string;
      year: string;
      actions: string;
      originalType: string;
      dayOfMonth: string;
    };
    backups: {
      current: {
        title: string;
        description: string;
      };
      daily: {
        title: string;
        description: string;
      };
      monthly: {
        title: string;
        description: string;
      };
      favorite: {
        title: string;
        description: string;
      };
      actions: {
        createUpdateCurrent: string;
        createUpdateDaily: string;
        createUpdateMonthly: string;
      };
      noBackupsFound: string;
    };
    actions: {
      delete: string;
      confirm: string;
      cancel: string;
      viewDetails: string;
      copy: string;
      copied: string;
      copySuccessTitle: string;
      copySuccessDescription: string;
    };
    modals: {
      confirmation: {
        title: string;
        deleteDescription: string;
        processingDescription: string;
      };
      deletion: {
        title: string;
        description: string;
      };
      creatingUpdating: {
        title: string;
        description: string;
      };
      toggleFavorite: {
        title: string;
        adding: string;
        removing: string;
      };
    };
    toasts: {
      success: {
        title: string;
        description: string;
      };
      error: {
        title: string;
        description: string;
      };
    };
    currentBackupTab: {
      title: string;
      description: string;
      contacts: string;
      createUpdateButton: string;
    };
    backupDetails: {
      title: string;
      itemsPerPage: string;
      page: string;
      of: string;
      data: string;
      select: string;
      all: string;
      previous: string;
      next: string;
    };
    backupActions: {
      alreadyInFavorites: string;
      addToFavorites: string;
      viewDetails: string;
      deleteBackup: string;
    };
    dataTable: {
      noFavoriteBackups: string;
    };
  };
}

export type TranslationKeys<T> = {
  [K in keyof T]: T[K] extends string
    ? K
    : T[K] extends Record<string, any>
    ? `${K & string}` | `${K & string}.${TranslationKeys<T[K]>}`
    : never;
}[keyof T];

export type TypedTranslationKeys = TranslationKeys<Translations>;
