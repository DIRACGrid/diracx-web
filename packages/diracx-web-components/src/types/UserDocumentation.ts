interface DocumentationSection {
  title: string;
  content: string;
}

interface appDocumentation {
  appName: string;
  sections: DocumentationSection[];
}

export interface UserDocumentation {
  generalUsage: string;
  applications: appDocumentation[];
}
