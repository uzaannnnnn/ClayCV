"use client";

import React, { useRef } from "react";
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

  const handleFileUpload = async (
    certId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File is too large. Maximum certificate size is 10 MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, PNG, JPG, and JPEG files are supported.");
      return;
    }

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
      alert("Failed to save certificate attachment locally.");
    }
  };

  const handleRemoveFile = async (certId: string, attachmentId?: string) => {
    if (attachmentId) {
      await deleteCertificateFile(attachmentId);
    }
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
        <div className="text-center py-6 px-4 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
          <Award className="w-8 h-8 text-[#A29FAC] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#292735]">
            No certifications added
          </p>
          <p className="text-xs text-[#777482] mt-0.5 mb-4">
            Add industry credentials, licenses, or course certificates.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addCertification()}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((item, idx) => (
            <div
              key={item.id}
              className="clay-card-sm p-4 sm:p-5 bg-white relative space-y-4 border border-[rgba(70,65,90,0.08)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#8B7CF6]">
                  CERTIFICATE #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCertification(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-[8px] hover:bg-red-50 cursor-pointer"
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
                  className="w-4 h-4 rounded text-[#8B7CF6] focus:ring-[#8B7CF6] cursor-pointer"
                />
                <label
                  htmlFor={`no-expiry-${item.id}`}
                  className="text-xs font-medium text-[#292735] cursor-pointer select-none"
                >
                  This credential does not expire (Tanpa Kedaluwarsa)
                </label>
              </div>

              {/* Credential ID & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Credential ID"
                  placeholder="e.g. AWS-839210-SAA"
                  value={item.credentialId}
                  onChange={(e) =>
                    updateCertification(item.id, {
                      credentialId: e.target.value,
                    })
                  }
                />
                <Input
                  label="Credential Verification URL"
                  placeholder="e.g. https://www.credly.com/badges/..."
                  value={item.credentialUrl}
                  onChange={(e) =>
                    updateCertification(item.id, {
                      credentialUrl: e.target.value,
                    })
                  }
                />
              </div>

              {/* Local File Attachment (IndexedDB) */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777482] mb-1.5">
                  Certificate Attachment (Stored locally in IndexedDB)
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
                        <p className="text-[10px] text-[#777482]">
                          {item.attachmentSize ? formatFileSize(item.attachmentSize) : "Attached"} • Stored in browser
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
                        className="p-1.5 text-[#6C5BD8] hover:bg-[#E8E3FF] rounded-[8px] transition-colors cursor-pointer"
                        title="Download original file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id, item.attachmentId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3.5 border border-dashed border-[rgba(70,65,90,0.2)] rounded-[14px] bg-[#FAF8F5] hover:bg-[#F4F1EB] text-xs font-medium text-[#777482] hover:text-[#292735] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#8B7CF6]" />
                    <span>Upload certificate document (PDF, PNG, JPG, max 10MB)</span>
                  </button>
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
            <Plus className="w-4 h-4 mr-1.5" />
            Add Another Certification
          </Button>
        </div>
      )}
    </div>
  );
}
