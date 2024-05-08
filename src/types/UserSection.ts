// Define the type for the userSections state
export type UserSection = {
  title: string;
  extended: boolean;
  items: {
    title: string;
    type: string;
    id: string;
    icon: React.ComponentType;
    data?: any;
  }[];
};
