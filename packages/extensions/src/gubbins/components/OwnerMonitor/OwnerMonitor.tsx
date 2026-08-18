"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "@dirac-grid/diracx-web-components/hooks";
import { fetcher } from "@dirac-grid/diracx-web-components/services";
import { Alert, Box, Button, Snackbar, TextField } from "@mui/material";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "@dirac-grid/diracx-web-components/components";
import { Owner } from "@/gubbins/types/Owner";

/**
 * Owner Monitor component
 * @returns Owner Monitor component
 */
export default function OwnerMonitor() {
  // Get info from the auth token
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);

  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerName, setOwnerName] = useState("");
  // Error state for the owner list fetch — passed to the DataTable
  const [fetchError, setFetchError] = useState<Error | null>(null);
  // Error state for user actions (e.g. adding an owner) — shown in an Alert
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25, // Default to 25 rows per page
  });

  // Fetch the list of owners
  const fetchOwners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetcher<string[]>({
        url: "/api/lollygag/get_owners",
        accessToken,
      });

      // Transform names into objects with id and name
      const transformedData = response.data.map((name, index) => ({
        ownerID: index + 1, // Generate a unique ID
        name, // Set the name
      }));
      setOwners(transformedData);
      setFetchError(null);
    } catch (err) {
      // Keep the fetcher's detailed message (HTTP status/detail) and let the
      // DataTable render the error state instead of an empty "No data" table
      setFetchError(
        err instanceof Error ? err : new Error("Failed to fetch owners"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Handle adding a new owner
  const handleAddOwner = async () => {
    if (!ownerName) return setError("Owner name cannot be empty.");
    try {
      await fetcher({
        url: `/api/lollygag/insert_owner/${ownerName}`,
        accessToken,
        method: "POST",
      });
      setSuccess(`Owner "${ownerName}" added successfully.`);
      setOwnerName("");
      fetchOwners(); // Refresh the owners list
    } catch (err) {
      // Surface the fetcher's detailed message rather than a generic one
      setError(err instanceof Error ? err.message : "Failed to add owner.");
    }
  };

  // Define table columns
  const columnHelper = createColumnHelper<Owner>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("ownerID", { header: "ID" }),
      columnHelper.accessor("name", { header: "Owner Name" }),
    ],
    [columnHelper],
  );

  // Table instance
  const table = useReactTable({
    data: owners,
    columns,
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      {/* Input to add owner */}
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          label="Owner Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          variant="outlined"
          fullWidth
          data-testid="owner-name-input"
        />
        <Button variant="contained" color="primary" onClick={handleAddOwner}>
          Add Owner
        </Button>
      </Box>

      {/* Success and Error messages */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      )}

      {/* Owner List Table */}
      <DataTable<Owner>
        title="Owners List"
        table={table}
        totalRows={owners.length}
        searchBody={{}}
        setSearchBody={() => {}}
        error={fetchError}
        isLoading={isLoading}
        toolbarComponents={<></>}
        menuItems={[]}
      />
    </Box>
  );
}
