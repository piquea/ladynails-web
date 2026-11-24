import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Reservar from "./Reservar";

export const metadata: Metadata = { title: "Reservar cita · Lady Nails Studio" };

export default function Pagina() {
  return (
    <>
      <Nav simple />
      <main className="contenedor" style={{ paddingTop: 116, paddingBottom: 80 }}>
        <Suspense>
          <Reservar />
        </Suspense>
      </main>
    </>
  );
}
