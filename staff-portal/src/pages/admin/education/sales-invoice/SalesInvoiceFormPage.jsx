import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/shared/OriginalPrimitives";
import SalesInvoiceForm from "./components/SalesInvoiceForm.jsx";
import {
  createSalesInvoice,
  getSalesInvoice,
  updateSalesInvoice,
} from "@/services/education/salesInvoiceService.js";
import { getErrorMessage } from "@/utils/errors.js";

export default function SalesInvoiceFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const editing = Boolean(id);
  const name = id ? decodeURIComponent(id) : null;
  // The profile page's "Return / Credit Note" action hands us a fully
  // mapped draft (real make_sales_return()) via router state instead of a
  // blank new record -- SalesInvoiceForm already treats a truthy `invoice`
  // prop as data to load rather than a blank form, so this is a drop-in.
  const [invoice, setInvoice] = useState(location.state?.prefill || null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;

    async function loadInvoice() {
      try {
        setInvoice(await getSalesInvoice(name));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [editing, name]);

  async function save(values) {
    try {
      let result;
      if (editing) {
        result = await updateSalesInvoice(name, values);
        toast.success("Sales invoice updated");
      } else {
        result = await createSalesInvoice(values);
        toast.success("Sales invoice created");
      }

      const resultName = result?.name || name;
      navigate(`/dashboard/sales-invoices/${encodeURIComponent(resultName)}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <div className="muted">Loading sales invoice…</div>;

  const isReadOnly = invoice && invoice.docstatus !== 0;

  return (
    <>
      <PageHeader
        eyebrow="Sales Invoices"
        title={editing ? "Edit Sales Invoice" : "Create Sales Invoice"}
        sub={isReadOnly ? "This document is read-only" : undefined}
      />
      <div className="panel">
        <SalesInvoiceForm invoice={invoice} onSave={save} />
      </div>
    </>
  );
}
