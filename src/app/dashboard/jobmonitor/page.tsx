import { JobDataGrid } from "@/components/data/JobDataGrid";

export default async function Page() {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Job Monitor</h2>
      <JobDataGrid />
    </div>
  );
}
