import { Breadcrumbs, Link } from "@mui/material";

/**
 * Display a path in the breadcrumb.
 *
 * @param path The path to display.
 * @param setPath The function to set the path.
 * @returns The breadcrumb component.
 */
export function BreadCrumbsTrail({
  path,
  setPath,
}: {
  path: string[];
  setPath?: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <Breadcrumbs>
      <Link
        onClick={() => {
          if (setPath) setPath([]);
        }}
        sx={{
          cursor: "pointer",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
        variant="h6"
      >
        Top
      </Link>
      {path.map((elt, index) => (
        <Link
          key={elt}
          onClick={() => {
            if (setPath) setPath((oldPath) => oldPath.slice(0, index + 1));
          }}
          sx={{
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
          variant="h6"
        >
          {elt}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
