export interface Owner {
  ownerID: number;
  name: string;
  // If you want to create DataTable columns for the Owner type, you can use the following snippet:
  [key: string]: unknown;
}
