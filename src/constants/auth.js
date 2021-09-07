const PARAMS = {
  SCOPES: {
    PROFILE: "https://www.googleapis.com/auth/userinfo.profile",
    EMAIL: "https://www.googleapis.com/auth/userinfo.email",
    CLOUD_PLATFORM: "https://www.googleapis.com/auth/cloud-platform",
    CLOUD_TRANSLATION: "https://www.googleapis.com/auth/cloud-translation",
    DEV_STORAGE: "https://www.googleapis.com/auth/devstorage.full_control",
  },
  CODE: "code",
  SELECT_ACCOUNT: "select_account",
};

const URLS = {
  GOOGLE_AUTH: "https://accounts.google.com/o/oauth2/v2/auth",
};

export { PARAMS, URLS };
