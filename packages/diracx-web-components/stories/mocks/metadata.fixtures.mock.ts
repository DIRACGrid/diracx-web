export const singleVOMetadata = {
  virtual_organizations: {
    DTeam: {
      groups: {
        admin: {
          properties: ["AdminUser"],
        },
        user: {
          properties: ["NormalUser"],
        },
      },
      support: {
        message: "Please contact system administrator",
        webpage: null,
        email: null,
      },
      default_group: "user",
    },
  },
};

export const multiVOMetadata = {
  virtual_organizations: {
    LHCp: {
      groups: {
        user: {
          properties: ["NormalUser"],
        },
        admin: {
          properties: ["AdminUser"],
        },
      },
      support: {
        message: "Please contact the system administrator",
        webpage: null,
        email: null,
      },
      default_group: "admin",
    },
    PridGG: {
      groups: {
        admin: {
          properties: ["NormalUser"],
        },
      },
      support: {
        message:
          "Please restart your machine, if it still does not work, please try again later",
        webpage: null,
        email: null,
      },
      default_group: "admin",
    },
  },
};
