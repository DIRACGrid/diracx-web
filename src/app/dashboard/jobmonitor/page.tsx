import { JobDataGrid } from "@/app/components/JobDataGrid";

const columns = [
  { field: 'id', headerName: 'Job ID', width: 70 },
  { field: 'name', headerName: 'Job Name', width: 70 },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'minor_status', headerName: 'Minor Status', width: 130 },
];

async function getJobs() {
  //const res = await fetch('https://api.example.com/...')
  //if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
  //  throw new Error('Failed to fetch data')
  //}
  //return res.json()
  
  const rows = [
    { id: 1, name: 'Gauss', status: 'Running', minor_status: 'Running' },
    { id: 2, name: 'Gauss', status: 'Running', minor_status: 'Running' },
    { id: 3, name: 'Boole', status: 'Running', minor_status: 'Running' },
    { id: 4, name: 'Gauss', status: 'Running', minor_status: 'Running' },
    { id: 5, name: 'Gauss', status: 'Waiting', minor_status: 'Running' },
    { id: 6, name: 'DaVinci', status: 'Done', minor_status: 'Running' },
    { id: 7, name: 'Gauss', status: 'Running', minor_status: 'Running' },
    { id: 8, name: 'Gauss', status: 'Done', minor_status: 'Running' },
    { id: 9, name: 'Gauss', status: 'Failed', minor_status: 'Running' },
  ];
  return rows
}


export default async function Page() {
    const rows = await getJobs()

    return (
      <div>
        <h2>Job Monitor</h2>
        <JobDataGrid rows={rows} columns={columns} />
      </div>
    );
  };