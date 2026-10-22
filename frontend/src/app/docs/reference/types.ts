/** Tipe bersama untuk seluruh konten dokumentasi. */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface Field {
  name: string;
  type: string;
  required?: boolean;
  note?: string;
}

export interface Endpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  auth: string;
  params?: Field[];
  body?: Field[];
  response: string;
  notes?: string[];
}

export interface ApiGroup {
  id: string;
  title: string;
  base: string;
  desc: string;
  endpoints: Endpoint[];
}

export interface FunctionDoc {
  name: string;
  signature: string;
  summary: string;
  params?: Field[];
  returns?: string;
  notes?: string[];
}

export interface ModuleDoc {
  id: string;
  file: string;
  title: string;
  desc: string;
  constants?: Field[];
  functions: FunctionDoc[];
}

export interface ComponentDoc {
  id: string;
  name: string;
  file: string;
  kind: string;
  summary: string;
  props?: Field[];
  exports?: Field[];
  details?: string[];
}

export interface PageDoc {
  route: string;
  file: string;
  role: string;
  summary: string;
  state?: string[];
  api?: string[];
  behaviors?: string[];
}

export interface Step {
  title: string;
  code: string;
}

export interface NoteDoc {
  title: string;
  text: string;
}

export interface StatusTransition {
  from: string;
  to: string;
  trigger: string;
}
