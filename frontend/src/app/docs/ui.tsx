import React from "react";
import type {
  ApiGroup,
  ComponentDoc,
  Endpoint,
  Field,
  HttpMethod,
  ModuleDoc,
  PageDoc,
} from "./reference";

type Node = React.ReactNode;
type TableHead = [string, string, string];

/* ---------- Primitif ---------- */

export const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-[12.5px] leading-relaxed text-slate-100">
    <code>{children}</code>
  </pre>
);

export const InlineCode = ({ children }: { children: Node }) => (
  <code className="whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-[0.85em] text-blue-700">
    {children}
  </code>
);

export const Card = ({ children }: { children: Node }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{children}</div>
);

export const Subheading = ({ children }: { children: Node }) => (
  <h4 className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-500">{children}</h4>
);

export const Note = ({ children }: { children: Node }) => (
  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13.5px] leading-relaxed text-blue-900">
    {children}
  </div>
);

export const List = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5 text-[14px] leading-relaxed text-slate-600">
    {items.map((item) => (
      <li key={item} className="flex gap-2">
        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const FieldTable = ({ fields, head }: { fields: Field[]; head?: TableHead }) => {
  const [c1, c2, c3] = head ?? ["Field", "Tipe", "Keterangan"];
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-[13.5px]">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            {[c1, c2, c3].map((label) => (
              <th key={label} className="px-3 py-2 font-bold">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fields.map((f) => (
            <tr key={f.name}>
              <td className="px-3 py-2 align-top font-mono text-[12.5px] font-semibold text-slate-800">
                {f.name}
                {f.required && <span className="ml-1 text-red-500">*</span>}
              </td>
              <td className="px-3 py-2 align-top font-mono text-[12.5px] text-blue-700">{f.type}</td>
              <td className="px-3 py-2 align-top text-slate-600">{f.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Judul kecil + tabel field. */
export const Fields = ({ title, fields, head }: { title: string; fields: Field[]; head?: TableHead }) => (
  <div>
    <Subheading>{title}</Subheading>
    <FieldTable fields={fields} head={head} />
  </div>
);

export const Section = ({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: Node;
  children: Node;
}) => (
  <section id={id} className="scroll-mt-28 pt-14 first:pt-0">
    <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
    {intro && <div className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">{intro}</div>}
    <div className="mt-6 space-y-6">{children}</div>
  </section>
);

/** Judul + grid dua kolom untuk kartu. */
export const Subsection = ({ title, children }: { title: string; children: Node }) => (
  <div>
    <h3 className="mb-4 text-xl font-black tracking-tight text-slate-900">{title}</h3>
    {children}
  </div>
);

export const CardGrid = ({ children }: { children: Node }) => (
  <div className="grid gap-5 lg:grid-cols-2">{children}</div>
);

export const Toc = ({ items }: { items: { id: string; label: string }[] }) => (
  <nav aria-label="Daftar isi" className="sticky top-6 hidden max-h-[calc(100vh-3rem)] overflow-y-auto xl:block">
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Daftar Isi</p>
    <ul className="mt-3 space-y-1 border-l border-slate-200">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[13.5px] font-semibold text-slate-500 transition-colors hover:border-blue-500 hover:text-blue-700"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

/* ---------- Endpoint ---------- */

const METHOD_STYLE: Record<HttpMethod, string> = {
  GET: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  POST: "bg-blue-100 text-blue-700 ring-blue-200",
  PUT: "bg-amber-100 text-amber-700 ring-amber-200",
  DELETE: "bg-red-100 text-red-700 ring-red-200",
};

export const EndpointCard = ({ ep }: { ep: Endpoint }) => (
  <Card>
    <div className="flex flex-wrap items-center gap-3">
      <span className={`rounded-md px-2 py-0.5 text-[11px] font-black tracking-wide ring-1 ${METHOD_STYLE[ep.method]}`}>
        {ep.method}
      </span>
      <code className="font-mono text-[14px] font-bold text-slate-900">{ep.path}</code>
    </div>
    <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{ep.summary}</p>
    <p className="mt-2 text-[13px] font-semibold text-slate-500">
      Akses: <span className="text-slate-700">{ep.auth}</span>
    </p>

    {ep.params?.length ? (
      <div className="mt-4">
        <Fields title="Parameter URL" fields={ep.params} head={["Parameter", "Tipe", "Keterangan"]} />
      </div>
    ) : null}
    {ep.body?.length ? (
      <div className="mt-4">
        <Fields title="Body permintaan" fields={ep.body} />
      </div>
    ) : null}

    <div className="mt-4">
      <Subheading>Contoh respons</Subheading>
      <Code>{ep.response}</Code>
    </div>

    {ep.notes?.length ? <div className="mt-4"><List items={ep.notes} /></div> : null}
  </Card>
);

export const ApiGroupSection = ({ group }: { group: ApiGroup }) => (
  <div id={group.id} className="scroll-mt-28">
    <div className="flex flex-wrap items-baseline gap-3">
      <h3 className="text-xl font-black tracking-tight text-slate-900">{group.title}</h3>
      <code className="font-mono text-[12.5px] text-slate-500">{group.base}</code>
    </div>
    <p className="mt-2 max-w-3xl text-[14.5px] leading-relaxed text-slate-600">{group.desc}</p>
    <div className="mt-4 space-y-4">
      {group.endpoints.map((ep) => (
        <EndpointCard key={ep.method + ep.path} ep={ep} />
      ))}
    </div>
  </div>
);

/* ---------- Modul / komponen / halaman ---------- */

export const ModuleCard = ({ mod }: { mod: ModuleDoc }) => (
  <Card>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h4 className="text-[17px] font-black tracking-tight text-slate-900">{mod.title}</h4>
      <code className="font-mono text-[12px] text-slate-400">{mod.file}</code>
    </div>
    <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{mod.desc}</p>

    {mod.constants?.length ? (
      <div className="mt-4">
        <Fields title="Konstanta & tipe" fields={mod.constants} head={["Nama", "Tipe", "Keterangan"]} />
      </div>
    ) : null}

    <ul className="mt-4 divide-y divide-slate-100">
      {mod.functions.map((fn) => (
        <li key={fn.name} className="py-4 first:pt-0 last:pb-0">
          <code className="font-mono text-[13px] font-bold text-blue-700">{fn.signature}</code>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">{fn.summary}</p>
          {fn.params?.length ? (
            <div className="mt-2.5">
              <Fields title="Parameter" fields={fn.params} head={["Parameter", "Tipe", "Keterangan"]} />
            </div>
          ) : null}
          {fn.returns && (
            <p className="mt-2 text-[13.5px] text-slate-600">
              <b className="font-bold text-slate-800">Mengembalikan: </b>
              {fn.returns}
            </p>
          )}
          {fn.notes?.length ? <div className="mt-2.5"><List items={fn.notes} /></div> : null}
        </li>
      ))}
    </ul>
  </Card>
);

export const ModuleGrid = ({ modules }: { modules: ModuleDoc[] }) => (
  <CardGrid>
    {modules.map((mod) => (
      <ModuleCard key={mod.id} mod={mod} />
    ))}
  </CardGrid>
);

export const ComponentCard = ({ doc }: { doc: ComponentDoc }) => (
  <Card>
    <div className="flex flex-wrap items-center gap-3">
      <h4 className="text-[17px] font-black tracking-tight text-slate-900">{doc.name}</h4>
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
        {doc.kind}
      </span>
    </div>
    <code className="mt-1 block font-mono text-[12px] text-slate-400">{doc.file}</code>
    <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{doc.summary}</p>

    {doc.props?.length ? (
      <div className="mt-4">
        <Fields title="Props" fields={doc.props} head={["Prop", "Tipe", "Keterangan"]} />
      </div>
    ) : null}
    {doc.exports?.length ? (
      <div className="mt-4">
        <Fields title="Ekspor tambahan" fields={doc.exports} head={["Nama", "Tipe", "Keterangan"]} />
      </div>
    ) : null}
    {doc.details?.length ? <div className="mt-4"><List items={doc.details} /></div> : null}
  </Card>
);

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  petugas: "bg-amber-100 text-amber-700",
  peminjam: "bg-emerald-100 text-emerald-700",
};

export const PageCard = ({ doc }: { doc: PageDoc }) => (
  <Card>
    <div className="flex flex-wrap items-center gap-3">
      <code className="font-mono text-[14px] font-bold text-slate-900">{doc.route}</code>
      <span className={`rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wide ${ROLE_STYLE[doc.role] ?? "bg-slate-100 text-slate-600"}`}>
        {doc.role}
      </span>
    </div>
    <code className="mt-1 block font-mono text-[12px] text-slate-400">{doc.file}</code>
    <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">{doc.summary}</p>

    {doc.state?.length ? <div className="mt-3"><Subheading>State</Subheading><List items={doc.state} /></div> : null}
    {doc.api?.length ? <div className="mt-3"><Subheading>Panggilan API</Subheading><List items={doc.api} /></div> : null}
    {doc.behaviors?.length ? <div className="mt-3"><Subheading>Perilaku</Subheading><List items={doc.behaviors} /></div> : null}
  </Card>
);
