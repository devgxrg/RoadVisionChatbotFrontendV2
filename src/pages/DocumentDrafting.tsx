import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Save, FileDown, Bot, ChevronLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { templateSchemas } from "@/data/templateSchemas";
import { Template } from "@/lib/types/document-drafting";
import { TemplateCard } from "@/components/drafting/TemplateCard";
import { DynamicForm } from "@/components/drafting/DynamicForm";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BackButton } from "@/components/common/BackButton";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

// Format date value for display (converts YYYY-MM-DD to readable format)
const formatDateValue = (dateValue: string): string => {
  if (!dateValue) return dateValue;
  
  try {
    // Check if it's already in YYYY-MM-DD format (from date input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const date = new Date(dateValue + 'T00:00:00'); // Add time to avoid timezone issues
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    // If already formatted, return as-is
    return dateValue;
  } catch {
    return dateValue;
  }
};

// Build draft text from template + form values (live preview support)
const buildContentFromTemplate = (template: Template | null, formValues: Record<string, string>): string => {
  if (!template) return "";
  let generatedContent = template.structure || "";

  // Replace placeholders with form values
  Object.entries(formValues).forEach(([key, value]) => {
    if (!value) return; // Skip empty values
    
    const placeholder = `[${key}]`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    
    // Check if this is a date field and format it nicely
    const field = template.fields?.find(f => f.label === key);
    const formattedValue = field?.type === 'date' ? formatDateValue(value) : value;
    
    generatedContent = generatedContent.replace(regex, formattedValue);
  });

  // Add current date (formatted)
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  generatedContent = generatedContent.replace(/\[Current Date\]/g, currentDate);

  return generatedContent;
};

export default function DocumentDrafting() {
  const navigate = useNavigate();
  const [view, setView] = useState<"gallery" | "instance">("gallery");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormValues({});
    setContent(template.structure || "");
    setView("instance");
    toast.success(`Template "${template.title}" loaded`);
  };

  const handleBackToGallery = () => {
    setView("gallery");
    setSelectedTemplate(null);
    setFormValues({});
    setContent("");
  };

  const handleFormChange = (fieldLabel: string, value: string) => {
    setFormValues(prev => {
      const updated = { ...prev, [fieldLabel]: value };
      // Live update preview as the user types
      setContent(buildContentFromTemplate(selectedTemplate, updated));
      return updated;
    });
  };

  const handleGenerateWithAI = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    const generatedContent = buildContentFromTemplate(selectedTemplate, formValues);
    setContent(generatedContent);
    toast.success("Draft generated with AI assistance!");
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }
    if (!content.trim()) {
      toast.error("Cannot save an empty draft");
      return;
    }

    try {
      const response = await fetch("/api/v1/legaliq/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          form_values: formValues,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  const handleExportPDF = async () => {
    if (!content.trim()) {
      toast.error("Please generate a document first");
      return;
    }

    try {
      const documentTitle = formValues["Project / Site Name"] || 
                           formValues["Subject of Notice"] ||
                           formValues["Case ID"] ||
                           selectedTemplate?.title || 
                           "Document";

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set document font
      pdf.setFont("times", "normal");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 25; // Increased margin for a more professional look
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      const lineHeight = 8; // Increased line height

      // Add a header
      pdf.setFontSize(18);
      pdf.setFont("times", "bold");
      pdf.text("GOVERNMENT OF INDIA", pageWidth / 2, yPosition, { align: "center" });
      yPosition += lineHeight * 2;


      // Add title
      if (documentTitle && documentTitle !== "Document") {
        pdf.setFontSize(16);
        pdf.setFont("times", "bold");
        const titleLines = pdf.splitTextToSize(documentTitle.toUpperCase(), maxWidth);
        pdf.text(titleLines, pageWidth / 2, yPosition, { align: "center" });
        yPosition += (titleLines.length * lineHeight) + 10;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("times", "normal");

      const lines = content.split('\n');

      lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        if (line.trim() === '') {
          yPosition += lineHeight;
          return;
        }
        
        const trimmedLine = line.trim();
        // Check if the line is a heading (ends with a colon or is all caps)
        const isHeading = trimmedLine.endsWith(':') || (trimmedLine !== '' && trimmedLine === trimmedLine.toUpperCase());
        
        if (isHeading) {
          pdf.setFont("times", "bold");
        } else {
          pdf.setFont("times", "normal");
        }

        const textLines = pdf.splitTextToSize(line, maxWidth);
        
        textLines.forEach((textLine: string) => {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          if (trimmedLine === "STATEMENT OF FACTS") {
            pdf.text(textLine, pageWidth / 2, yPosition, { align: "center" });
          } else {
            pdf.text(textLine, margin, yPosition);
          }
          yPosition += lineHeight;
        });
      });

      // Add footer with page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      const filename = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const handleExportDOCX = async () => {
    if (!content.trim()) {
      toast.error("Please generate a document first");
      return;
    }

    try {
      // Get document title from form values or template name
      const documentTitle = formValues["Project / Site Name"] || 
                           formValues["Subject of Notice"] ||
                           formValues["Case ID"] ||
                           selectedTemplate?.title || 
                           "Document";

      // Split content into paragraphs
      const paragraphs: Paragraph[] = [];
      const lines = content.split('\n');

      // Add title if available
      if (documentTitle && documentTitle !== "Document") {
        paragraphs.push(
          new Paragraph({
            text: documentTitle,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
          })
        );
      }

      // Process content lines
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Skip empty lines or add spacing
        if (trimmedLine === '') {
          if (index > 0 && lines[index - 1].trim() !== '') {
            paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
          }
          return;
        }

        // Check if line looks like a heading (all caps or starts with specific patterns)
        const isHeading = trimmedLine === trimmedLine.toUpperCase() && 
                         trimmedLine.length < 100 &&
                         !trimmedLine.includes(':') &&
                         trimmedLine.split(' ').length < 10;

        if (isHeading) {
          paragraphs.push(
            new Paragraph({
              text: trimmedLine,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 },
            })
          );
        } else {
          // Regular paragraph
          // Split by colons to handle labels
          if (trimmedLine.includes(':')) {
            const [label, ...valueParts] = trimmedLine.split(':');
            const value = valueParts.join(':').trim();
            
            if (value) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label + ': ',
                      bold: true,
                    }),
                    new TextRun({
                      text: value,
                    }),
                  ],
                  spacing: { after: 120 },
                })
              );
            } else {
              paragraphs.push(
                new Paragraph({
                  text: trimmedLine,
                  spacing: { after: 120 },
                })
              );
            }
          } else {
            paragraphs.push(
              new Paragraph({
                text: trimmedLine,
                spacing: { after: 120 },
              })
            );
          }
        }
      });

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      // Generate and download the DOCX file
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("DOCX exported successfully!");
    } catch (error) {
      console.error("Error exporting DOCX:", error);
      toast.error("Failed to export DOCX. Please try again.");
    }
  };

  const handleAskAI = () => {
    navigate("/ask-ai");
  };

  // Template Gallery View
  if (view === "gallery") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <BackButton to="/ceigalliq" />
            <h1 className="text-3xl font-bold text-foreground mb-2 mt-2">Document Drafting & Generation</h1>
            <p className="text-muted-foreground">
              Select a template to start creating AI-powered legal documents
            </p>
          </div>
          <Button onClick={handleAskAI} variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            Ask AI for Help
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templateSchemas.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={handleUseTemplate}
            />
          ))}
        </div>
      </div>
    );
  }

  // Template Instance View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={handleBackToGallery}
                className="cursor-pointer hover:text-violet"
              >
                Document Drafting
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{selectedTemplate?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex gap-2">
          <BackButton onClick={handleBackToGallery} variant="outline" />
          <Button onClick={handleAskAI} variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            Ask AI for Help
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel: Context & Details Form */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Context & Details</CardTitle>
              <CardDescription>Fill in the fields to generate your document</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTemplate && (
                <DynamicForm
                  fields={selectedTemplate.fields}
                  values={formValues}
                  onChange={handleFormChange}
                />
              )}
            </CardContent>
          </Card>

          <Button 
            onClick={handleGenerateWithAI} 
            className="w-full gap-2 bg-gradient-to-r from-violet to-primary hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Generate with LegalAI
          </Button>
        </div>

        {/* Right Panel: AI Edit Document */}
        <div className="space-y-6">
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-violet" />
                    AI Edit Document
                  </CardTitle>
                  <CardDescription>Modify the AI-generated draft as needed</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Click 'Generate with LegalAI' to create your document..."
                    className="min-h-[500px] font-mono text-sm"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Formatted Preview</CardTitle>
                  <CardDescription>See how your document will look</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[500px] whitespace-pre-wrap font-serif text-sm leading-relaxed p-8 bg-background rounded border border-border">
                    {content || "Your formatted document will appear here..."}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={handleSaveTemplate} variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={handleExportDOCX} className="gap-2 bg-gradient-to-r from-violet to-primary hover:opacity-90">
                  <FileDown className="h-4 w-4" />
                  DOCX
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
