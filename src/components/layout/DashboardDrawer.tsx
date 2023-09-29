import { DiracLogo } from "../ui/DiracLogo";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  Icon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Dashboard, FolderCopy } from "@mui/icons-material";
import MonitorIcon from "@mui/icons-material/Monitor";
import MenuBookIcon from "@mui/icons-material/MenuBook";

// Sections accessible to the users
const userSections: Record<
  string,
  { icon: React.ComponentType; path: string }
> = {
  Dashboard: { icon: Dashboard, path: "/dashboard" },
  "Job Monitor": { icon: MonitorIcon, path: "/dashboard/jobmonitor" },
  "File Catalog": { icon: FolderCopy, path: "/dashboard/filecatalog" },
};

export default function DashboardDrawer() {
  const pathname = usePathname();

  return (
    <div>
      <Toolbar>
        <DiracLogo />
      </Toolbar>
      <List>
        {Object.keys(userSections).map((title: string) => (
          <ListItem key={title} disablePadding>
            <ListItemButton
              component={NextLink}
              href={userSections[title]["path"]}
              selected={pathname === userSections[title]["path"]}
            >
              <ListItemIcon>
                <Icon component={userSections[title]["icon"]} />
              </ListItemIcon>
              <ListItemText primary={title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List style={{ position: "absolute", bottom: "0" }}>
        <ListItem key={"Documentation"}>
          <ListItemButton
            target="_blank"
            href="https://dirac.readthedocs.io/en/latest/"
          >
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary={"Documentation"} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
}
