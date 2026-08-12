import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  "property-type": z.enum([
    "Homeowner",
    "Seasonal Owner",
    "Rental Owner",
    "Property Manager",
  ]),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

export function RequestPickupForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot — silently drop bot submissions
    if ((fd.get("bot-field") as string)?.length) {
      setStatus("success");
      return;
    }

    const raw = {
      name: (fd.get("name") as string) ?? "",
      email: (fd.get("email") as string) ?? "",
      phone: (fd.get("phone") as string) ?? "",
      "property-type": (fd.get("property-type") as string) ?? "",
      message: (fd.get("message") as string) ?? "",
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const body = encode({ "form-name": "request-pickup", ...parsed.data, message: parsed.data.message ?? "" });
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        "We couldn't send your request. Please call 843-441-7804 or email CustomCarting@gmail.com.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-brand-sand p-10 text-center">
        <h3 className="text-2xl font-bold text-brand-navy">Request received</h3>
        <p className="mt-3 text-brand-navy/70">
          Thanks — we'll be in touch shortly to confirm pickup details for your Fripp Island property.
        </p>
        <p className="mt-6 text-sm text-brand-navy/60">
          Need us sooner? Call{" "}
          <a href="tel:8434417804" className="font-semibold text-brand-accent">
            843-441-7804
          </a>
          .
        </p>
      </div>
    );
  }

  const inputCls =
    "mt-2 w-full rounded-xl border border-brand-navy/10 bg-white px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20";

  return (
    <form
      name="request-pickup"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <input type="hidden" name="form-name" value="request-pickup" />
      <p className="hidden">
        <label>
          Don't fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-brand-navy">
          Name
          <input name="name" type="text" required maxLength={100} className={inputCls} placeholder="Your name" />
          {errors.name && <span className="mt-1 block text-xs font-medium text-red-600">{errors.name}</span>}
        </label>
        <label className="block text-sm font-semibold text-brand-navy">
          Phone
          <input name="phone" type="tel" required maxLength={30} className={inputCls} placeholder="(843) 555-0123" />
          {errors.phone && <span className="mt-1 block text-xs font-medium text-red-600">{errors.phone}</span>}
        </label>
      </div>

      <label className="block text-sm font-semibold text-brand-navy">
        Email
        <input name="email" type="email" required maxLength={255} className={inputCls} placeholder="you@example.com" />
        {errors.email && <span className="mt-1 block text-xs font-medium text-red-600">{errors.email}</span>}
      </label>

      <label className="block text-sm font-semibold text-brand-navy">
        Property type
        <select name="property-type" required className={inputCls} defaultValue="Homeowner">
          <option>Homeowner</option>
          <option>Seasonal Owner</option>
          <option>Rental Owner</option>
          <option>Property Manager</option>
        </select>
      </label>

      <label className="block text-sm font-semibold text-brand-navy">
        Message
        <textarea name="message" rows={4} required maxLength={1000} className={inputCls} placeholder="Address, gate code, preferred pickup location, etc." />
        {errors.message && <span className="mt-1 block text-xs font-medium text-red-600">{errors.message}</span>}
      </label>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-brand-navy py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-accent disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Get a Free Quote"}
      </button>
    </form>
  );
}