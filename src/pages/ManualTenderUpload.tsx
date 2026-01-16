import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export default function ManualTenderUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    tender_title: '',
    tender_description: '',
    employer_name: '',
    estimated_cost: '',
    submission_deadline: '',
    location: '',
    category: '',
    opportunity_name: '',
    opportunity_description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "File selected",
      description: file.name,
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!formData.tender_title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a tender title",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress({
      fileName: selectedFile.name,
      progress: 0,
      status: 'uploading'
    });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('tender_title', formData.tender_title);
      
      if (formData.tender_description) formDataToSend.append('tender_description', formData.tender_description);
      if (formData.employer_name) formDataToSend.append('employer_name', formData.employer_name);
      if (formData.estimated_cost) formDataToSend.append('estimated_cost', formData.estimated_cost);
      if (formData.submission_deadline) formDataToSend.append('submission_deadline', formData.submission_deadline);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (formData.category) formDataToSend.append('category', formData.category);
      if (formData.opportunity_name) formDataToSend.append('opportunity_name', formData.opportunity_name);
      if (formData.opportunity_description) formDataToSend.append('opportunity_description', formData.opportunity_description);

      const response = await fetch('/api/v1/manual-tenders/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadProgress({
        fileName: selectedFile.name,
        progress: 100,
        status: 'success'
      });

      setUploadedId(result.id);

      toast({
        title: "Upload successful",
        description: `Tender "${formData.tender_title}" uploaded successfully. Analysis is being processed.`,
      });

      // Reset form
      setTimeout(() => {
        setFormData({
          tender_title: '',
          tender_description: '',
          employer_name: '',
          estimated_cost: '',
          submission_deadline: '',
          location: '',
          category: '',
          opportunity_name: '',
          opportunity_description: '',
        });
        setSelectedFile(null);
        setUploadProgress(null);
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({
        fileName: selectedFile.name,
        progress: 0,
        status: 'error',
        errorMessage
      });

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Manually Upload Tender
          </h1>
          <p className="text-slate-600">
            Upload an RFP/Tender document that wasn't scraped from the system. Complete the form below and our AI will analyze it just like scraped tenders.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload Section */}
          <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Document Upload
              </CardTitle>
              <CardDescription>
                Upload PDF or DOCX file (Max 50MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="block border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {selectedFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        PDF or DOCX files up to 50MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        uploadProgress.status === 'success'
                          ? 'bg-green-500'
                          : uploadProgress.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{uploadProgress.fileName}</span>
                    <span className="text-slate-500">{uploadProgress.progress}%</span>
                  </div>
                  {uploadProgress.errorMessage && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadProgress.errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tender Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tender Details</CardTitle>
              <CardDescription>
                Fill in the tender information to provide context for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tender Title - Required */}
              <div className="grid gap-2">
                <label htmlFor="tender_title" className="text-sm font-medium text-slate-900">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="tender_title"
                  name="tender_title"
                  value={formData.tender_title}
                  onChange={handleInputChange}
                  placeholder="e.g., Construction of New Highway Bridge"
                  required
                  disabled={uploading}
                  className="border-slate-300"
                />
              </div>

              {/* Tender Description */}
              <div className="grid gap-2">
                <label htmlFor="tender_description" className="text-sm font-medium text-slate-900">
                  Tender Description
                </label>
                <Textarea
                  id="tender_description"
                  name="tender_description"
                  value={formData.tender_description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the tender..."
                  disabled={uploading}
                  className="border-slate-300 resize-none"
                  rows={3}
                />
              </div>

              {/* Grid: Employer and Cost */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="employer_name" className="text-sm font-medium text-slate-900">
                    Employer/Authority Name
                  </label>
                  <Input
                    id="employer_name"
                    name="employer_name"
                    value={formData.employer_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ministry of Road Transport"
                    disabled={uploading}
                    className="border-slate-300"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="estimated_cost" className="text-sm font-medium text-slate-900">
                    Estimated Cost (Crore)
                  </label>
                  <Input
                    id="estimated_cost"
                    name="estimated_cost"
                    type="number"
                    value={formData.estimated_cost}
                    onChange={handleInputChange}
                    placeholder="e.g., 150"
                    disabled={uploading}
                    className="border-slate-300"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Grid: Location and Category */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="location" className="text-sm font-medium text-slate-900">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Delhi, Tamil Nadu"
                    disabled={uploading}
                    className="border-slate-300"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium text-slate-900">
                    Category
                  </label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Road, Building, Bridge"
                    disabled={uploading}
                    className="border-slate-300"
                  />
                </div>
              </div>

              {/* Submission Deadline */}
              <div className="grid gap-2">
                <label htmlFor="submission_deadline" className="text-sm font-medium text-slate-900">
                  Submission Deadline
                </label>
                <Input
                  id="submission_deadline"
                  name="submission_deadline"
                  type="datetime-local"
                  value={formData.submission_deadline}
                  onChange={handleInputChange}
                  disabled={uploading}
                  className="border-slate-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Context Section */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Context</CardTitle>
              <CardDescription>
                Link this tender to a specific business opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="opportunity_name" className="text-sm font-medium text-slate-900">
                  Opportunity Name
                </label>
                <Input
                  id="opportunity_name"
                  name="opportunity_name"
                  value={formData.opportunity_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Delhi Metro Extension Project"
                  disabled={uploading}
                  className="border-slate-300"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="opportunity_description" className="text-sm font-medium text-slate-900">
                  Opportunity Description
                </label>
                <Textarea
                  id="opportunity_description"
                  name="opportunity_description"
                  value={formData.opportunity_description}
                  onChange={handleInputChange}
                  placeholder="Describe why this tender is relevant to your organization..."
                  disabled={uploading}
                  className="border-slate-300 resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !selectedFile}
              className="min-w-32"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>

          {/* Success Message */}
          {uploadedId && (
            <Alert className="bg-green-50 border-green-200 text-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Tender uploaded successfully! Your tender is being analyzed. You'll receive updates as the analysis progresses.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
