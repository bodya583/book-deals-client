export type SupportedLanguage = 'uk' | 'en';

export interface TranslationDictionary {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    back: string;
    confirm: string;
    yes: string;
    no: string;
    search: string;
    all: string;
    close: string;
    details: string;
    notFound: string;
    km: string;
    itemsCount: string;
    booksCount: string;
  };
  nav: {
    catalog: string;
    myBooks: string;
    trades: string;
    profile: string;
    login: string;
    register: string;
    logout: string;
    newTrade: string;
  };
  auth: {
    welcomeBack: string;
    signInSubtitle: string;
    createAccount: string;
    joinSubtitle: string;
    email: string;
    password: string;
    username: string;
    signInBtn: string;
    signUpBtn: string;
    noAccount: string;
    haveAccount: string;
    signingIn: string;
    creatingAccount: string;
  };
  catalog: {
    title: string;
    subtitle: string;
    myBooksTitle: string;
    myBooksSubtitle: string;
    searchPlaceholder: string;
    genreAll: string;
    cityAll: string;
    forTradeOnly: string;
    viewGrid: string;
    viewMap: string;
    addBook: string;
    emptyCatalogTitle: string;
    emptyCatalogText: string;
    emptyMyBooksTitle: string;
    emptyMyBooksText: string;
    loadingCatalog: string;
    loadingMyBooks: string;
  };
  bookCard: {
    forTrade: string;
    notForTrade: string;
    yearSuffix: string;
    detailsBtn: string;
    owner: string;
    city: string;
    approxDistance: string;
  };
  trades: {
    title: string;
    subtitle: string;
    newTradeBtn: string;
    composeTrade: string;
    searchPlaceholder: string;
    sort: {
      turn: string;
      newest: string;
      oldest: string;
      updated: string;
    };
    tabs: {
      requests: string;
      agreed: string;
      completed: string;
    };
    card: {
      youGive: string;
      youGet: string;
      partner: string;
      openDetails: string;
      acceptBtn: string;
      rejectBtn: string;
      cancelBtn: string;
      counterBtn: string;
      completeBtn: string;
    };
    badges: {
      pending: string;
      agreed: string;
      completed: string;
      rejected: string;
      cancelled: string;
      yourTurn: string;
      partnerTurn: string;
      incoming: string;
      outgoing: string;
    };
    details: {
      backToTrades: string;
      statusTitle: string;
      matrixTitle: string;
      chatTitle: string;
      chatPlaceholder: string;
      sendBtn: string;
      proposeMeeting: string;
      proposeTime: string;
      confirmReceivedNotice: string;
      waitingPartnerConfirmation: string;
      bothConfirmed: string;
    };
    empty: {
      requestsTitle: string;
      requestsText: string;
      agreedTitle: string;
      agreedText: string;
      completedTitle: string;
      completedText: string;
    };
  };
  handover: {
    title: string;
    location: string;
    time: string;
    agreed: string;
    notAgreed: string;
    agreeLocationBtn: string;
    agreeTimeBtn: string;
    proposeLocationTitle: string;
    proposeTimeTitle: string;
  };
  offer: {
    title: string;
    counterTitle: string;
    selectPartner: string;
    choosePartnerPlaceholder: string;
    yourBooks: string;
    theirBooks: string;
    emptySlot: string;
    inventoryTitle: string;
    messagePlaceholder: string;
    sendOfferBtn: string;
    sendCounterBtn: string;
    submitting: string;
    selectedSummary: string;
  };
  profile: {
    title: string;
    city: string;
    cityNotSet: string;
    memberSince: string;
    booksCount: string;
    tradesCount: string;
    editProfile: string;
    userLibrary: string;
    proposeTradeWithUser: string;
    allBooksTab: string;
    forTradeTab: string;
    collectionTab: string;
  };
  modals: {
    addBookTitle: string;
    editBookTitle: string;
    bookTitle: string;
    bookAuthor: string;
    bookGenre: string;
    bookYear: string;
    bookCity: string;
    bookCondition: string;
    bookDescription: string;
    bookOpenForTrade: string;
    saveBookBtn: string;
    rejectModalTitle: string;
    rejectReasonPlaceholder: string;
    rejectConfirmBtn: string;
    deleteBookConfirm: string;
  };
}
