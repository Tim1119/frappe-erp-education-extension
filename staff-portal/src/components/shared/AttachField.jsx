import { useRef, useState } from "react";
import toast from "react-hot-toast";

function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]')?.content;
  if (meta) return meta;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : window.csrf_token || "";
}

export default function AttachField({ value, onChange, label = "file", image = false, disabled = false, doctype, docname, fieldname }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("is_private", "1");
      if (doctype) body.append("doctype", doctype);
      if (docname) body.append("docname", docname);
      if (fieldname) body.append("fieldname", fieldname);
      const token = csrfToken();
      const response = await fetch("/api/method/upload_file", {
        method: "POST",
        credentials: "same-origin",
        headers: token ? { "X-Frappe-CSRF-Token": token } : undefined,
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.message?.file_url) throw new Error(data.message || "Upload failed");
      onChange(data.message.file_url);
    } catch (error) {
      toast.error(error?.message || "File upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const filename = value ? decodeURIComponent(String(value).split("/").pop()) : "";
  return <div className="space-y-2">{image&&value?<img src={value} alt={filename} className="h-20 w-20 rounded-md border object-cover"/>:null}{value?<div className="flex min-w-0 items-center gap-3"><a href={value} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-primary underline">{filename}</a><button type="button" disabled={disabled||uploading} onClick={()=>onChange("")} className="text-xs text-destructive hover:underline">Remove</button></div>:<><input ref={inputRef} type="file" accept={image?"image/*":undefined} aria-label={`Upload ${label}`} onChange={handleFile} disabled={disabled||uploading} className="block max-w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-muted"/>{uploading?<p className="text-xs text-muted-foreground">Uploading...</p>:null}</>}</div>;
}
