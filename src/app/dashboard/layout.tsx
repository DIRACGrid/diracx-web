import React from 'react';
import { MainStructure } from '../components/Structure';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <div>
    <MainStructure>
        {children}
    </MainStructure>
  </div>
  );
}