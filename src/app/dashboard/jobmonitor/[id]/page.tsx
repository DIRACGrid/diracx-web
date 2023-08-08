export default function Page({
    params
}: {
    params: {id: string}
}) {
    return <h1>Hello, Job Monitoring {params.id}  Page!</h1>
  }