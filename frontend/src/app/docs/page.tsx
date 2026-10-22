import type { Metadata } from "next";
import {
  apiGroups,
  components,
  controllerModules,
  dbObjects,
  dbTables,
  envVars,
  feServices,
  gotchas,
  libModules,
  middlewareModule,
  modelModules,
  pages,
  serviceModules,
  setupSteps,
  stack,
  statusFlow,
  stockRules,
  roles,
  structure,
} from "./reference";
import {
  ApiGroupSection,
  Card,
  CardGrid,
  Code,
  ComponentCard,
  FieldTable,
  InlineCode,
  List,
  ModuleCard,
  ModuleGrid,
  Note,
  PageCard,
  Section,
  Subsection,
  Toc,
} from "./ui";

export const metadata: Metadata = {
  title: "Dokumentasi — Invela Control",
  description:
    "Dokumentasi lengkap API, fungsi, dan komponen aplikasi peminjaman alat Invela Control (Next.js + Express + MariaDB).",
};

const TOC = [
  { id: "ringkasan", label: "Ringkasan Aplikasi" },
  { id: "struktur", label: "Struktur Proyek" },
  { id: "memulai", label: "Menjalankan Aplikasi" },
  { id: "basis-data", label: "Skema Basis Data" },
  { id: "alur", label: "Alur Status & Stok" },
  { id: "api", label: "Referensi API" },
  { id: "backend", label: "Fungsi Backend" },
  { id: "frontend-lib", label: "Helper & Layanan Frontend" },
  { id: "frontend-komponen", label: "Komponen" },
  { id: "frontend-halaman", label: "Halaman & Rute" },
  { id: "catatan", label: "Catatan Penting" },
];

const layers = [
  {
    title: "Lapisan backend",
    text: "Route memasang middleware (verifyToken → checkRole), controller memvalidasi input dan membentuk respons, service menampung aturan bisnis, dan model menjadi satu-satunya tempat penulisan SQL.",
    flow: "route → controller → service → model → MariaDB",
  },
  {
    title: "Lapisan frontend",
    text: "Halaman (client component) memanggil layanan per resource; layanan tersebut memakai apiFetch yang otomatis menempelkan token JWT dari cookie.",
    flow: "page → service → apiFetch → backend /api",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Invela Control</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Dokumentasi Aplikasi
          </h1>
          <p className="mt-4 max-w-3xl text-[15.5px] leading-relaxed text-slate-600">
            Sistem peminjaman alat dengan tiga peran (admin, petugas, peminjam). Halaman ini
            mendokumentasikan seluruh endpoint API, fungsi backend & frontend, serta komponen dan
            halaman yang ada di aplikasi.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {stack.map((s) => (
              <span key={s.label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12.5px] font-semibold text-slate-600">
                <span className="font-black text-slate-900">{s.label}: </span>
                {s.value}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 xl:grid-cols-[220px_minmax(0,1fr)]">
        <Toc items={TOC} />

        <main className="min-w-0">
          <Section
            id="ringkasan"
            title="Ringkasan Aplikasi"
            intro={
              <>
                Aplikasi terdiri dari dua bagian: <strong>backend REST</strong> (Express 5 +
                MariaDB) yang menangani data dan aturan bisnis, serta <strong>frontend</strong>{" "}
                (Next.js App Router) yang menyajikan antarmuka untuk tiga peran. Setiap peran masuk
                melalui halaman login yang sama dan diarahkan ke menu sesuai perannya.
              </>
            }
          >
            <CardGrid>
              {roles.map((r) => (
                <Card key={r.name}>
                  <h3 className="font-mono text-[15px] font-black text-blue-700">{r.name}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{r.desc}</p>
                  <p className="mt-3 break-words font-mono text-[12px] leading-relaxed text-slate-400">{r.pages}</p>
                </Card>
              ))}
            </CardGrid>
          </Section>

          <Section id="struktur" title="Struktur Proyek" intro="Dua aplikasi terpisah dalam satu repositori, dijalankan lewat dua proses berbeda.">
            <Code>{structure}</Code>
            <CardGrid>
              {layers.map((l) => (
                <Card key={l.title}>
                  <h3 className="text-[16px] font-black text-slate-900">{l.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{l.text}</p>
                  <p className="mt-3 font-mono text-[12.5px] leading-relaxed text-blue-700">{l.flow}</p>
                </Card>
              ))}
            </CardGrid>
          </Section>

          <Section id="memulai" title="Menjalankan Aplikasi" intro="Urutan pemasangan dari database MariaDB sampai frontend.">
            <div className="space-y-5">
              {setupSteps.map((step) => (
                <Card key={step.title}>
                  <h3 className="text-[15px] font-black text-slate-900">{step.title}</h3>
                  <div className="mt-3">
                    <Code>{step.code}</Code>
                  </div>
                </Card>
              ))}
            </div>
            <Subsection title="Variabel lingkungan">
              <FieldTable fields={envVars} head={["Variabel", "Lokasi & default", "Keterangan"]} />
            </Subsection>
          </Section>

          <Section
            id="basis-data"
            title="Skema Basis Data (MariaDB)"
            intro={
              <>
                Didefinisikan di <InlineCode>scema.sql</InlineCode> (tabel InnoDB) dan{" "}
                <InlineCode>trigger.sql</InlineCode> (trigger & procedure). Seluruh perubahan stok
                terjadi di trigger, bukan di aplikasi.
              </>
            }
          >
            <ModuleGrid modules={dbTables} />
            <Subsection title="Trigger & procedure">
              <ModuleGrid modules={dbObjects} />
            </Subsection>
            <Note>
              <strong>Relasi:</strong> kategori → alat (cascade), user → peminjaman (cascade),
              peminjaman → detail_peminjaman & pengembalian (cascade). Menghapus kategori akan
              menghapus seluruh alat di dalamnya.
            </Note>
          </Section>

          <Section id="alur" title="Alur Status & Stok" intro="Setiap transaksi berjalan melalui status berikut; transisi dijaga di peminjamanService.">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-[14px]">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5 font-bold">Status asal</th>
                    <th className="px-4 py-2.5 font-bold">Status tujuan</th>
                    <th className="px-4 py-2.5 font-bold">Dipicu oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusFlow.map((s) => (
                    <tr key={s.from + s.to}>
                      <td className="px-4 py-2.5 font-semibold text-slate-700">{s.from}</td>
                      <td className="px-4 py-2.5 font-bold text-blue-700">{s.to}</td>
                      <td className="px-4 py-2.5 font-mono text-[12.5px] text-slate-600">{s.trigger}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Note>
              <strong>Aturan stok:</strong>
              <div className="mt-2">
                <List items={stockRules} />
              </div>
            </Note>
          </Section>

          <Section
            id="api"
            title="Referensi API"
            intro={
              <>
                Semua endpoint berada di bawah prefix <InlineCode>/api</InlineCode> pada URL dasar{" "}
                <InlineCode>NEXT_PUBLIC_API_URL</InlineCode>. Kecuali health check dan endpoint
                auth, setiap request membutuhkan header{" "}
                <InlineCode>Authorization: Bearer &lt;token&gt;</InlineCode>. Galat selalu
                berbentuk <InlineCode>{"{ message: string }"}</InlineCode>.
              </>
            }
          >
            <div className="space-y-10">
              {apiGroups.map((group) => (
                <ApiGroupSection key={group.id} group={group} />
              ))}
            </div>
          </Section>

          <Section id="backend" title="Fungsi Backend" intro="Dokumentasi fungsi yang diekspor setiap modul, berurutan dari middleware sampai model.">
            <ModuleCard mod={middlewareModule} />
            <Subsection title="Controllers">
              <ModuleGrid modules={controllerModules} />
            </Subsection>
            <Subsection title="Services">
              <ModuleGrid modules={serviceModules} />
            </Subsection>
            <Subsection title="Models & konfigurasi">
              <ModuleGrid modules={modelModules} />
            </Subsection>
          </Section>

          <Section id="frontend-lib" title="Helper & Layanan Frontend" intro="Lapisan akses API di sisi klien: satu pembungkus fetch, helper transaksi, dan layanan per resource.">
            <ModuleGrid modules={[...libModules, ...feServices]} />
          </Section>

          <Section id="frontend-komponen" title="Komponen" intro="Komponen React yang dipakai lintas halaman.">
            <CardGrid>
              {components.map((doc) => (
                <ComponentCard key={doc.id} doc={doc} />
              ))}
            </CardGrid>
          </Section>

          <Section id="frontend-halaman" title="Halaman & Rute" intro="Seluruh rute App Router beserta data yang dimuat dan aksi yang tersedia. Nama folder di bawah src/app menjadi segmen URL.">
            <CardGrid>
              {pages.map((doc) => (
                <PageCard key={doc.route + doc.file} doc={doc} />
              ))}
            </CardGrid>
          </Section>

          <Section id="catatan" title="Catatan Penting" intro="Perilaku yang mudah terlewat saat mengembangkan aplikasi ini.">
            <div className="grid gap-4 md:grid-cols-2">
              {gotchas.map((g) => (
                <Card key={g.title}>
                  <h3 className="text-[15px] font-black text-slate-900">{g.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{g.text}</p>
                </Card>
              ))}
            </div>
            <Note>
              Dokumen ini dibuat dari pembacaan kode sumber. Bila menambah endpoint atau komponen,
              perbarui <InlineCode>src/app/docs/reference/</InlineCode> agar halaman ini tetap
              akurat.
            </Note>
          </Section>

          <footer className="mt-16 border-t border-slate-200 pt-6 text-[13px] text-slate-400">
            Invela Control — dokumentasi dihasilkan otomatis dari struktur kode aplikasi.
          </footer>
        </main>
      </div>
    </div>
  );
}
