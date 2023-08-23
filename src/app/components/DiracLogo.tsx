import NextLink from 'next/link';
import Image from 'next/image';

export function DiracLogo() {
  return (
    <>
      <NextLink href="/dashboard">
        <Image
          src='/DIRAC-logo.png'
          alt="DIRAC logo"
          width={200}
          height={70}
        />
      </NextLink>
    </>
  );
}
