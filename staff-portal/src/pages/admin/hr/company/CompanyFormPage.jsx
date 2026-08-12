import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import CompanyForm from "./components/CompanyForm";
import { createCompany, getCompany, updateCompany } from "@/services/hr/companyService";
import { getErrorMessage } from "@/utils/errors";

export default function CompanyFormPage() {
  const navigate = useNavigate(); const { id } = useParams(); const editing = Boolean(id); const name = id ? decodeURIComponent(id) : null;
  const [company, setCompany] = useState(null); const [loading, setLoading] = useState(editing);
  useEffect(() => { if (!editing) return; getCompany(name).then(setCompany).catch((err) => toast.error(getErrorMessage(err))).finally(() => setLoading(false)); }, [editing, name]);
  async function save(values) { try { const result = editing ? await updateCompany(name, values) : await createCompany(values); toast.success(editing ? "Company updated" : "Company created"); navigate(`/dashboard/company/${encodeURIComponent(result?.name || name)}`); } catch (err) { toast.error(getErrorMessage(err)); } }
  if (loading) return <div className="muted">Loading company…</div>;
  return <><PageHeader eyebrow="HR" title={editing ? "Edit Company" : "Create Company"} /><div className="panel"><CompanyForm company={company} onSave={save} /></div></>;
}
