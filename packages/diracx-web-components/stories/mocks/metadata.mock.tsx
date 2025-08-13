import { Metadata } from "../../src/hooks/metadata";

// Create a store for mock data
let mockMetadataResponse: {
  metadata: Metadata | null;
  error: Error | null;
  isLoading: boolean;
} = {
  metadata: null,
  error: null,
  isLoading: false,
};

// Function to set mock data
export function setMetadataMock(data: {
  metadata: Metadata | null;
  error: Error | null;
  isLoading: boolean;
}) {
  mockMetadataResponse = data;
}

// Mock hook that returns the stored mock data
export const useMetadata = () => mockMetadataResponse;
