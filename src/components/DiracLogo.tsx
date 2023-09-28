import NextLink from "next/link";
import Image from "next/image";

/**
 * Logo of the DIRAC interware redirecting to the root page
 * @returns a NextLink embedding an Image
 */
export function DiracLogo() {
  return (
    <>
      <NextLink href="/">
        <Image src="/DIRAC-logo.png" alt="DIRAC logo" width={150} height={55} />
      </NextLink>
    </>
  );
}
