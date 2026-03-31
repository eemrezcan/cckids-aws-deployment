// components/QuoteRequestForm.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { createQuoteRequest } from "@/lib/api/endpoints";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Variant = "product" | "contact";

type QuoteRequestFormProps = {
  variant?: Variant;

  // Ürün bağlamı (opsiyonel)
  productId?: number | null;
  productUuid?: string | null;
  productName?: string | null;

  // Ürün seçimleri (opsiyonel)
  selectedColorName?: string | null;
  selectedSizeLabel?: string | null;
  productImageUrl?: string | null;

  className?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Tekilleştirilmiş teklif formu:
 * - variant="product": ürün detay sayfası (renk/boyut/adet/şehir/kurum/not -> message içine gömülür)
 * - variant="contact": iletişim sayfası (subject/city/company -> message içine gömülür)
 * - POST /public/quote-requests
 */
export default function QuoteRequestForm({
  variant = "product",
  productId = null,
  productUuid = null,
  productName = null,
  selectedColorName = null,
  selectedSizeLabel = null,
  productImageUrl = null,
  className,
}: QuoteRequestFormProps) {
  const { t } = useLanguage();
  const isContact = variant === "contact";
  const interpolate = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), template);

  // ortak
  const [okId, setOkId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // honeypot (botlar için)
  const [honeypot, setHoneypot] = useState("");

  // PRODUCT form state
  const [pName, setPName] = useState("");
  const [pCompany, setPCompany] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pCity, setPCity] = useState("");
  const [pQty, setPQty] = useState<number>(1);
  const [pNote, setPNote] = useState("");

  // CONTACT form state
  const [cFirstName, setCFirstName] = useState("");
  const [cLastName, setCLastName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cCompany, setCCompany] = useState("");
  const [cCity, setCCity] = useState("");
  const [cSubject, setCSubject] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cPrivacy, setCPrivacy] = useState(false);

  const cFullName = useMemo(() => {
    return [cFirstName.trim(), cLastName.trim()].filter(Boolean).join(" ");
  }, [cFirstName, cLastName]);

  function resetStatus() {
    setOkId(null);
    setErrorMsg("");
  }

  function validateProduct(): string | null {
    if (!pName.trim()) return t("quoteForm.validation.fillName", "Lütfen ad soyad alanını doldurun.");
    if (pEmail.trim() && !isValidEmail(pEmail.trim())) return t("quoteForm.validation.invalidEmail", "Lütfen geçerli bir e-posta girin.");
    if (!pPhone.trim()) return t("quoteForm.validation.fillPhone", "Lütfen telefon alanını doldurun.");
    if (!pEmail.trim()) return t("quoteForm.validation.fillEmail", "Lütfen e-posta alanını doldurun.");
    if (!pQty || pQty < 1) return t("quoteForm.validation.qtyMin", "Adet en az 1 olmalı.");
    return null;
  }

  function validateContact(): string | null {
    if (!cFirstName.trim()) return t("quoteForm.validation.fillFirstName", "Lütfen adınızı yazın.");
    if (!cLastName.trim()) return t("quoteForm.validation.fillLastName", "Lütfen soyadınızı yazın.");
    if (!cEmail.trim()) return t("quoteForm.validation.fillContactEmail", "Lütfen e-posta adresinizi yazın.");
    if (cEmail.trim() && !isValidEmail(cEmail.trim())) return t("quoteForm.validation.invalidEmail", "Lütfen geçerli bir e-posta girin.");
    if (!cSubject.trim()) return t("quoteForm.validation.fillSubject", "Lütfen konu seçin.");
    if (!cMessage.trim()) return t("quoteForm.validation.fillMessage", "Lütfen mesajınızı yazın.");
    if (!cPrivacy) return t("quoteForm.validation.acceptPrivacy", "Lütfen gizlilik politikasını kabul edin.");
    return null;
  }

  function buildProductMessage() {
    const intro = interpolate(
      t("quoteForm.message.productIntro", "Merhaba, \"{product}\" için fiyat teklifi almak istiyorum."),
      { product: productName ?? t("quoteForm.labels.selectedProduct", "Seçili Ürün") },
    );
    const lines = [
      intro,
      selectedColorName ? interpolate(t("quoteForm.message.color", "Renk: {value}"), { value: selectedColorName }) : null,
      selectedSizeLabel ? interpolate(t("quoteForm.message.size", "Boyut: {value}"), { value: selectedSizeLabel }) : null,
      pQty ? interpolate(t("quoteForm.message.quantity", "Adet: {value}"), { value: pQty }) : null,
      pCompany.trim() ? interpolate(t("quoteForm.message.company", "Kurum: {value}"), { value: pCompany.trim() }) : null,
      pCity.trim() ? interpolate(t("quoteForm.message.city", "Şehir: {value}"), { value: pCity.trim() }) : null,
      pNote.trim() ? interpolate(t("quoteForm.message.note", "Not: {value}"), { value: pNote.trim() }) : null,
    ].filter(Boolean) as string[];
    return lines.join("\n");
  }

  function buildContactMessage() {
    const lines = [
      interpolate(t("quoteForm.message.subject", "Konu: {value}"), { value: cSubject.trim() }),
      cCompany.trim() ? interpolate(t("quoteForm.message.company", "Kurum: {value}"), { value: cCompany.trim() }) : null,
      cCity.trim() ? interpolate(t("quoteForm.message.city", "Şehir: {value}"), { value: cCity.trim() }) : null,
      "",
      t("quoteForm.message.messageTitle", "Mesaj:"),
      cMessage.trim(),
    ].filter((x) => x !== null) as string[];
    return lines.join("\n");
  }

  async function submitProduct() {
    resetStatus();

    const v = validateProduct();
    if (v) {
      setErrorMsg(v);
      return;
    }

    // honeypot doluysa sessiz başarı
    if (honeypot.trim()) {
      setOkId(0);
      return;
    }

    const message = buildProductMessage();

    startTransition(async () => {
      try {
        const res = await createQuoteRequest({
          name: pName.trim(),
          email: pEmail.trim(),
          phone: pPhone.trim() || null,
          message,
          product_id: productId ?? null,
          product_uuid: productUuid ?? null,
        });

        setOkId(res.id);
        setPName("");
        setPCompany("");
        setPEmail("");
        setPPhone("");
        setPCity("");
        setPQty(1);
        setPNote("");
      } catch (err: any) {
        setErrorMsg(typeof err?.message === "string" ? err.message : t("quoteForm.submitError", "Gönderim sırasında bir hata oluştu."));
      }
    });
  }

  async function submitContact() {
    resetStatus();

    const v = validateContact();
    if (v) {
      setErrorMsg(v);
      return;
    }

    if (honeypot.trim()) {
      setOkId(0);
      return;
    }

    const message = buildContactMessage();

    startTransition(async () => {
      try {
        const res = await createQuoteRequest({
          name: cFullName,
          email: cEmail.trim(),
          phone: cPhone.trim() || null,
          message,
          product_uuid: null,
          product_id: null,
        });

        setOkId(res.id);
        setCFirstName("");
        setCLastName("");
        setCEmail("");
        setCPhone("");
        setCCompany("");
        setCCity("");
        setCSubject("");
        setCMessage("");
        setCPrivacy(false);
      } catch (err: any) {
        setErrorMsg(typeof err?.message === "string" ? err.message : t("quoteForm.submitError", "Gönderim sırasında bir hata oluştu."));
      }
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isContact) return void submitContact();
    return void submitProduct();
  }

  if (isContact) {
    return (
      <div className={["bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden", className].filter(Boolean).join(" ")}>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cc-pink via-cc-cyan to-cc-yellow" />

        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cc-text mb-3">
            {t("quoteForm.contactTitle", "Bize Yazın ✍️")}
          </h2>
          <p className="text-gray-500">{t("quoteForm.contactSubtitle", "Formu doldurun, size en kısa sürede dönelim.")}</p>
        </div>

        {okId !== null ? (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700">
            {t("quoteForm.messageReceived", "Mesajınız alındı. En kısa sürede dönüş yapacağız. ✅")}
          </div>
        ) : null}

        {errorMsg ? (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">{errorMsg}</div>
        ) : null}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="hidden">
            <label>Company</label>
            <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.firstName", "Ad *")}</label>
              <input
                value={cFirstName}
                onChange={(e) => setCFirstName(e.target.value)}
                type="text"
                placeholder={t("quoteForm.labels.firstNamePlaceholder", "Adınız")}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.lastName", "Soyad *")}</label>
              <input
                value={cLastName}
                onChange={(e) => setCLastName(e.target.value)}
                type="text"
                placeholder={t("quoteForm.labels.lastNamePlaceholder", "Soyadınız")}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.email", "E-posta *")}</label>
              <input
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                type="email"
                placeholder={t("quoteForm.labels.emailPlaceholder", "ornek@email.com")}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.phone", "Telefon")}</label>
              <input
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                type="tel"
                placeholder={t("quoteForm.labels.phonePlaceholder", "0532 123 45 67")}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.company", "Kurum Adı")}</label>
              <input
                value={cCompany}
                onChange={(e) => setCCompany(e.target.value)}
                type="text"
                placeholder={t("quoteForm.labels.companyPlaceholder", "Kreş / Anaokulu adı")}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.city", "Şehir")}</label>
              <input
                value={cCity}
                onChange={(e) => setCCity(e.target.value)}
                type="text"
                placeholder={t("quoteForm.labels.cityPlaceholder", "Şehir")}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.subject", "Konu *")}</label>
            <select
              value={cSubject}
              onChange={(e) => setCSubject(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">{t("quoteForm.labels.subjectPlaceholder", "Konu seçin")}</option>
              <option value="Fiyat Teklifi Almak İstiyorum">{t("quoteForm.subjects.quote", "Fiyat Teklifi Almak İstiyorum")}</option>
              <option value="Ürün Bilgisi Almak İstiyorum">{t("quoteForm.subjects.info", "Ürün Bilgisi Almak İstiyorum")}</option>
              <option value="Teknik Destek">{t("quoteForm.subjects.support", "Teknik Destek")}</option>
              <option value="Şikayet / Öneri">{t("quoteForm.subjects.feedback", "Şikayet / Öneri")}</option>
              <option value="Bayilik Başvurusu">{t("quoteForm.subjects.dealership", "Bayilik Başvurusu")}</option>
              <option value="Diğer">{t("quoteForm.subjects.other", "Diğer")}</option>
            </select>
          </div>

          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.message", "Mesajınız *")}</label>
            <textarea
              value={cMessage}
              onChange={(e) => setCMessage(e.target.value)}
              rows={5}
              placeholder={t("quoteForm.labels.messagePlaceholder", "Mesajınızı buraya yazın...")}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all text-gray-700 placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              checked={cPrivacy}
              onChange={(e) => setCPrivacy(e.target.checked)}
              type="checkbox"
              id="privacy"
              className="w-5 h-5 mt-1 accent-cc-pink rounded"
            />
            <label htmlFor="privacy" className="text-sm text-gray-500">
              <a href="#" className="text-cc-pink hover:underline">
                {t("quoteForm.privacyLink", "Gizlilik Politikası")}
              </a>
              {" "}
              {t("quoteForm.privacySuffix", "'nı okudum ve kabul ediyorum. Kişisel verilerimin işlenmesine izin veriyorum.")}
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{isPending ? t("common.sending", "Gönderiliyor...") : t("common.send", "Gönder")}</span>
            <span aria-hidden>✈️</span>
          </button>
        </form>
      </div>
    );
  }

  // PRODUCT
  return (
    <div className={["bg-white rounded-[2.3rem] p-8 md:p-12", className].filter(Boolean).join(" ")}>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="hidden">
          <label>Company</label>
          <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        {/* Ürün barı (ProductDetailClient ile uyumlu) */}
        <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 mb-2">
          {productImageUrl ? (
            <img src={productImageUrl} alt={t("quoteForm.labels.productImageAlt", "Ürün")} className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-200" />
          )}
          <div>
            <p className="font-display font-bold text-cc-text">{productName ?? t("quoteForm.labels.selectedProduct", "Seçili Ürün")}</p>
            <p className="text-sm text-gray-500">
              {t("quoteForm.labels.selected", "Seçili")}:{" "}
              <span className="font-semibold">{selectedColorName ?? t("productDetail.fallbackOption", "—")}</span> -{" "}
              <span className="font-semibold">{selectedSizeLabel ?? t("productDetail.fallbackOption", "—")}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.fullName", "Ad Soyad *")}</label>
            <input
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              name="name"
              type="text"
              placeholder={t("quoteForm.labels.fullNamePlaceholder", "Adınız Soyadınız")}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.company", "Kurum Adı")}</label>
            <input
              value={pCompany}
              onChange={(e) => setPCompany(e.target.value)}
              name="company"
              type="text"
              placeholder={t("quoteForm.labels.companyPlaceholder", "Kreş / Anaokulu adı")}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.email", "E-posta *")}</label>
            <input
              value={pEmail}
              onChange={(e) => setPEmail(e.target.value)}
              name="email"
              type="email"
              placeholder={t("quoteForm.labels.emailPlaceholder", "ornek@email.com")}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.phoneRequired", "Telefon *")}</label>
            <input
              value={pPhone}
              onChange={(e) => setPPhone(e.target.value)}
              name="phone"
              type="tel"
              placeholder={t("quoteForm.labels.phonePlaceholder", "0532 123 45 67")}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.city", "Şehir")}</label>
            <input
              value={pCity}
              onChange={(e) => setPCity(e.target.value)}
              name="city"
              type="text"
              placeholder={t("quoteForm.labels.cityPlaceholder", "Şehir")}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.quantity", "Adet *")}</label>
            <input
              value={pQty}
              onChange={(e) => setPQty(Math.max(1, Number(e.target.value || 1)))}
              name="qty"
              type="number"
              min={1}
              required
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block font-display font-semibold text-cc-text mb-2">{t("quoteForm.labels.note", "Not (Opsiyonel)")}</label>
          <textarea
            value={pNote}
            onChange={(e) => setPNote(e.target.value)}
            name="note"
            rows={3}
            placeholder={t("quoteForm.labels.notePlaceholder", "Özel isteklerinizi belirtin...")}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-cc-pink focus:bg-white transition-all resize-none"
          />
        </div>

        {errorMsg ? (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm">{errorMsg}</div>
        ) : null}

        {okId !== null ? (
          <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-2xl text-sm">
            {t("quoteForm.requestReceived", "Talebiniz alındı!")}
            {okId ? ` ${interpolate(t("quoteForm.requestTrackNo", "Takip No: #{id}"), { id: okId })}` : ""} 🎉
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-5 bg-gradient-to-r from-cc-pink to-cc-orange text-white font-display font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? t("common.sending", "Gönderiliyor...") : t("quoteForm.requestQuote", "Teklif İste")}
        </button>
      </form>
    </div>
  );
}
