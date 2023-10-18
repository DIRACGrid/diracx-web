import React from "react";
import { render } from "@testing-library/react";
import { DiracLogo } from "@/components/ui/DiracLogo";

describe("<DiracLogo />", () => {
  it("renders the logo image with correct attributes", () => {
    const { getByAltText } = render(<DiracLogo />);

    // Check if the image is rendered with the correct alt text
    const logoImage = getByAltText("DIRAC logo");
    expect(logoImage).toBeInTheDocument();
  });

  it("renders the link that redirects to the root page", () => {
    const { getByRole } = render(<DiracLogo />);

    // Check if the link is rendered and points to the root page
    const link = getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
