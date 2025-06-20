import { userDocumentation } from "@dirac-grid/diracx-web-components/components";
import { UserDocumentation } from "@dirac-grid/diracx-web-components/types";

// New Application List with the default ones + the Owner Monitor
const userDoc: UserDocumentation = userDocumentation;

userDoc.applications.push({
  appName: "Owner Monitor",
  sections: [
    {
      title: "General Usage",
      content: `
# General Usage

Manage and monitor the owners of electric scooters in your area. The Owner Monitor application allows you to view, add, and manage owners, ensuring that all scooters are accounted for and properly maintained. You can track ownership details, monitor scooter conditions, and ensure compliance with local regulations.`,
    },
    {
      title: "Definition",
      content: `
# Definition of Gubbins

**Gubbins** is a British informal noun referring to small, miscellaneous items or bits and pieces, often of little value or importance. It can describe gadgets, parts, or knick-knacks whose exact names might not be known or remembered. The term is frequently used to refer to odds and ends lying around or small components in a machine. Sometimes, it can imply something trivial or unimportant, almost like "stuff" or "junk." In some contexts, it can also humorously refer to technical or mechanical parts, especially those that are confusing or complicated. While common in UK English, the word is less known in American English, where similar expressions might be "bits and bobs" or "thingamajigs." Overall, "gubbins" conveys a casual, somewhat affectionate sense of miscellaneous small items`,
    },
  ],
});

export { userDoc as userDocumentation };
export default userDoc;
