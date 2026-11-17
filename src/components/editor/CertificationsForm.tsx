"use client";

import React, { useRef, useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MonthYearSelect } from "@/components/ui/month-year-select";
import {
  saveCertificateFile,
  deleteCertificateFile,
  downloadCertificateFile,
} from "@/lib/storage/indexed-db";
import { generateId, formatFileSize } from "@/lib/utils";
import { Award, Plus, Trash2, Upload, Download, FileText } from "lucide-react";

export function CertificationsForm() {
  const { cvData, addCertification, updateCertification, removeCertification } =
    useCVStore();
  const { certifications, language } = cvData;
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const setCertError = (certId: string, msg: string | null) => {
    setUploadErrors((prev) => {
      const next = { ...prev };
      if (msg) {
        next[certId] = msg;
      } else {
        delete next[certId];
      }
      return next;
    });
  };

  const handleFileUpload = async (
    certId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setCertError(certId, "File is too large. Maximum certificate size is 10 MB.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      setCertError(certId, "Only PDF, PNG, JPG, and JPEG files are supported.");
      e.target.value = "";
      return;
    }

    setCertError(certId, null);
    const attachmentId = generateId();
    try {
      await saveCertificateFile(attachmentId, file);
      updateCertification(certId, {
        attachmentId,
        attachmentName: file.name,
        attachmentSize: file.size,
        attachmentType: file.type,
      });
    } catch (err) {
      console.error("IndexedDB error:", err);
      setCertError(certId, "Could not save this file in browser storage. Please try again.");
    }
  };

  const handleRemoveFile = async (certId: string, attachmentId?: string) => {
    if (attachmentId) {
      await deleteCertificateFile(attachmentId);
    }
    setCertError(certId, null);
    updateCertification(certId, {
      attachmentId: undefined,
      attachmentName: undefined,
      attachmentSize: undefined,
      attachmentType: undefined,
    });
  };

  return (
    <div className="space-y-5 pt-2">
      {certifications.length === 0 ? (
        <div className="text-center py-5 sm:py-6 px-4 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
          <Award className="w-7 h-7 sm:w-8 sm:h-8 text-[#6D697A] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#292735]">
            No certifications added
          </p>
          <p className="hidden sm:block text-xs text-[#595566] mt-0.5 mb-4">
            Add industry credentials, licenses, or course certificates.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addCertification()}
            className="mt-3 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Certification</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((item, idx) => (
            <div
              key={item.id}
              className="clay-card-sm p-3.5 sm:p-5 bg-white relative space-y-3.5 sm:space-y-4 border border-[rgba(70,65,90,0.08)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#6C5BD8]">
                  CERTIFICATE #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCertification(item.id)}
                  className="min-h-[40px] sm:min-h-[36px] text-xs font-medium text-[#B91C1C] hover:text-[#991B1B] flex items-center gap-1 transition-colors px-2.5 py-1 rounded-[10px] hover:bg-red-50 cursor-pointer"
                  title="Remove this certificate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Name & Issuing Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Certificate Name *"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={item.name}
                  onChange={(e) =>
                    updateCertification(item.id, { name: e.target.value })
                  }
                />
                <Input
                  label="Issuing Organization *"
                  placeholder="e.g. Amazon Web Services, Google Cloud"
                  value={item.issuingOrganization}
                  onChange={(e) =>
                    updateCertification(item.id, {
                      issuingOrganization: e.target.value,
                    })
                  }
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MonthYearSelect
                  label="Issue Date"
                  monthValue={item.issueMonth}
                  yearValue={item.issueYear}
                  onChangeMonth={(m) =>
                    updateCertification(item.id, { issueMonth: m })
                  }
                  onChangeYear={(y) =>
                    updateCertification(item.id, { issueYear: y })
                  }
                  language={language}
                  idPrefix={`cert-issue-${item.id}`}
                />

                <MonthYearSelect
                  label="Expiration Date"
                  monthValue={item.noExpiry ? null : item.expiryMonth}
                  yearValue={item.noExpiry ? null : item.expiryYear}
                  onChangeMonth={(m) =>
                    updateCertification(item.id, { expiryMonth: m })
                  }
                  onChangeYear={(y) =>
                    updateCertification(item.id, { expiryYear: y })
                  }
                  disabled={item.noExpiry}
                  language={language}
                  idPrefix={`cert-expiry-${item.id}`}
                />
              </div>

              {/* No Expiry Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id={`no-expiry-${item.id}`}
                  checked={item.noExpiry}
                  onChange={(e) =>
                    updateCertification(item.id, {
                      noExpiry: e.target.checked,
                      expiryMonth: e.target.checked ? null : item.expiryMonth,
                      expiryYear: e.target.checked ? null : item.expiryYear,
                    })
                  }
                  className="w-4 h-4 rounded text-[#6C5BD8] focus:ring-[#6C5BD8] cursor-pointer"
                />
                <label
                  htmlFor={`no-expiry-${item.id}`}
                  className="text-xs font-medium text-[#292735] cursor-pointer select-none"
                >
                  This credential does not expire
                </label>
              </div>

              {/* Credential ID & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-start">
                <Input
                  label="Credential ID"
                  labelClassName="block text-[11px] font-bold uppercase tracking-wider text-[#595566] truncate whitespace-nowrap"
                  placeholder="e.g. AWS-839210-SAA"
                  value={item.credentialId}
                  onChange={(e) =>
                    updateCertification(item.id, {
                      credentialId: e.target.value,
                    })
                  }
                />
                <Input
                  label="Credential URL"
                  labelClassName="block text-[11px] font-bold uppercase tracking-wider text-[#595566] truncate whitespace-nowrap"
                  placeholder="e.g. https://www.credly.com/badges/..."
                  value={item.credentialUrl}
                  onChange={(e) =>
                    updateCertification(item.id, {
                      credentialUrl: e.target.value,
                    })
                  }
                />
              </div>

              {/* Local File Attachment */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566]">
                  Certificate File (Stored in your browser)
                </label>

                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[item.id] = el;
                  }}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => handleFileUpload(item.id, e)}
                />

                {item.attachmentName ? (
                  <div className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-[14px] border border-[rgba(70,65,90,0.08)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] bg-[#E8E3FF] text-[#6C5BD8] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#292735] truncate">
                          {item.attachmentName}
                        </p>
                        <p className="text-xs text-[#595566]">
                          {item.attachmentSize ? formatFileSize(item.attachmentSize) : "Attached"} • Saved in your browser
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() =>
                          item.attachmentId &&
                          downloadCertificateFile(item.attachmentId, item.attachmentName)
                        }
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#6C5BD8] hover:bg-[#E8E3FF] rounded-[10px] transition-colors cursor-pointer"
                        title="Download original file"
                        aria-label={`Download ${item.attachmentName}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id, item.attachmentId)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#B91C1C] hover:bg-red-50 rounded-[10px] transition-colors cursor-pointer"
                        title="Remove attachment"
                        aria-label={`Remove attachment ${item.attachmentName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 p-3.5 border border-dashed border-[rgba(70,65,90,0.22)] rounded-[14px] bg-[#FAF8F5] hover:bg-[#F4F1EB] text-xs font-medium text-[#595566] hover:text-[#292735] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#6C5BD8]" />
                    <span>Upload certificate file (PDF, PNG, JPG, max 10MB)</span>
                  </button>
                )}

                {uploadErrors[item.id] && (
                  <p role="alert" className="text-xs text-[#B91C1C] font-medium">
                    {uploadErrors[item.id]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addCertification()}
            className="w-full"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Certification</span>
          </Button>
        </div>
      )}
    </div>
  );
}
