import ShowcaseAppBar from "./components/ShowcaseAppBar";

const containerStyles = {
  marginLeft: "30%",
  marginRight: "30%",
};

export default function Page() {
  return (
    <div style={containerStyles}>
      <ShowcaseAppBar />
    </div>
  );
}
