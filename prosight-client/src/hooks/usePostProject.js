// src/hooks/usePostProject.js
import { useState } from "react";
import { useApp } from "../context/AppContext";

const EMPTY = { title: "", category: "", budget: "", description: "" };

export function usePostProject() {
  const { postProject, showToast } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.title || !form.category || !form.budget) {
      showToast("Fill in all required fields", "error");
      return;
    }
    setSubmitting(true);
    try {
      await postProject({
        title: form.title,
        category: form.category,
        budget: Number(form.budget),
        description: form.description,
      });
      setForm(EMPTY);
      setOpen(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => { setForm(EMPTY); setOpen(false); };

  return { form, updateField, open, setOpen, submit, cancel, submitting };
}
