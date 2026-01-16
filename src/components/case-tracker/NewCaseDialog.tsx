import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadCase } from "@/lib/api/case-tracker";
import { Case } from "@/lib/types/case-tracker";

interface NewCaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCaseCreated: (newCase: Case) => void;
}

export function NewCaseDialog({
    open,
    onOpenChange,
    onCaseCreated,
}: NewCaseDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        caseTitle: "",
        caseId: "",
        courtName: "",
        caseType: "Arbitration",
        litigationStatus: "Pending",
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Validate file type
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                toast.error("Only PDF files are allowed");
                return;
            }

            // Validate file size (50MB)
            if (file.size > 50 * 1024 * 1024) {
                toast.error("File size must be less than 50MB");
                return;
            }

            setSelectedFile(file);
            toast.success(`File "${file.name}" selected`);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        multiple: false,
        maxSize: 50 * 1024 * 1024
    });

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error("Please select a PDF file to upload");
            return;
        }

        setUploading(true);

        try {
            // Prepare metadata (only include if user provided)
            const metadata: any = {};
            if (formData.caseTitle.trim()) metadata.caseTitle = formData.caseTitle;
            if (formData.caseId.trim()) metadata.caseId = formData.caseId;
            if (formData.courtName.trim()) metadata.courtName = formData.courtName;
            metadata.caseType = formData.caseType;
            metadata.litigationStatus = formData.litigationStatus;

            const response = await uploadCase(selectedFile, metadata);

            toast.success(response.message);
            onCaseCreated(response.case);

            // Reset form
            setSelectedFile(null);
            setFormData({
                caseTitle: "",
                caseId: "",
                courtName: "",
                caseType: "Arbitration",
                litigationStatus: "Pending",
            });

            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to upload case");
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Case</DialogTitle>
                    <DialogDescription>
                        Upload a legal document (PDF) and optionally provide case details.
                        Our AI will analyze the document and extract case information automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label>Document Upload *</Label>

                        {!selectedFile ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                        ? "border-primary bg-primary/5"
                                        : "border-muted-foreground/25 hover:border-primary/50"
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm text-foreground font-medium mb-1">
                                    {isDragActive
                                        ? "Drop the PDF file here"
                                        : "Drag & drop a PDF file here, or click to select"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    PDF files only, max 50MB
                                </p>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 flex items-center justify-between bg-secondary">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    disabled={uploading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Optional Metadata */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Optional Case Details</Label>
                            <p className="text-xs text-muted-foreground">
                                AI will auto-fill if left empty
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="caseTitle">Case Title</Label>
                                <Input
                                    id="caseTitle"
                                    placeholder="e.g., ABC Ltd. vs XYZ Corp."
                                    value={formData.caseTitle}
                                    onChange={(e) =>
                                        setFormData({ ...formData, caseTitle: e.target.value })
                                    }
                                    disabled={uploading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="caseId">Case ID</Label>
                                <Input
                                    id="caseId"
                                    placeholder="e.g., CC/2025/12345"
                                    value={formData.caseId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, caseId: e.target.value })
                                    }
                                    disabled={uploading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="courtName">Court Name</Label>
                                <Input
                                    id="courtName"
                                    placeholder="e.g., District Court"
                                    value={formData.courtName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, courtName: e.target.value })
                                    }
                                    disabled={uploading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="caseType">Case Type</Label>
                                <Select
                                    value={formData.caseType}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, caseType: value })
                                    }
                                    disabled={uploading}
                                >
                                    <SelectTrigger id="caseType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Arbitration">Arbitration</SelectItem>
                                        <SelectItem value="Civil Suit">Civil Suit</SelectItem>
                                        <SelectItem value="Criminal">Criminal</SelectItem>
                                        <SelectItem value="Contract Dispute">Contract Dispute</SelectItem>
                                        <SelectItem value="Payment Dispute">Payment Dispute</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="litigationStatus">Status</Label>
                                <Select
                                    value={formData.litigationStatus}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, litigationStatus: value })
                                    }
                                    disabled={uploading}
                                >
                                    <SelectTrigger id="litigationStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Under Review">Under Review</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedFile || uploading}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading & Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Analyze
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
