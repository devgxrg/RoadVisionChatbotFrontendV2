import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScopeOfWorkData } from '@/lib/types/analyze.type';

interface ScopeOfWorkProps {
  scopeOfWork: ScopeOfWorkData;
}

export default function ScopeOfWork({ scopeOfWork }: ScopeOfWorkProps) {
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold">Project Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Project Name</p>
            <p className="font-medium">{scopeOfWork.project_details.project_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{scopeOfWork.project_details.location}</p>
          </div>
          {scopeOfWork.project_details.total_length && (
            <div>
              <p className="text-muted-foreground">Total Length</p>
              <p className="font-medium">{scopeOfWork.project_details.total_length}</p>
            </div>
          )}
          {scopeOfWork.project_details.total_area && (
            <div>
              <p className="text-muted-foreground">Total Area</p>
              <p className="font-medium">{scopeOfWork.project_details.total_area}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">{scopeOfWork.project_details.duration}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contract Value</p>
            <p className="font-medium">{scopeOfWork.project_details.contract_value}</p>
          </div>
        </div>
      </Card>

      {/* Work Packages */}
      {scopeOfWork.work_packages.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-2xl font-bold">Work Packages</h3>
          <Accordion type="single" collapsible className="space-y-2">
            {scopeOfWork.work_packages.map((pkg, idx) => (
              <AccordionItem key={idx} value={`pkg-${idx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="text-left">
                    <p className="font-semibold text-lg">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {pkg.components && (
                      <div>
                        <h4 className="font-semibold mb-3">Components</h4>
                        <ul className="space-y-2">
                          {pkg.components.map((comp, cidx) => (
                            <li key={cidx} className="text-sm">
                              <p className="font-medium">{comp.item}</p>
                              <p className="text-muted-foreground">{comp.description}</p>
                              {comp.quantity && comp.unit && (
                                <p className="text-xs text-muted-foreground">
                                  Quantity: {comp.quantity} {comp.unit}
                                </p>
                              )}
                              {comp.specifications && (
                                <p className="text-xs text-muted-foreground">
                                  Specs: {comp.specifications}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.estimated_duration && (
                      <p className="text-sm">
                        <span className="font-semibold">Duration:</span> {pkg.estimated_duration}
                      </p>
                    )}
                    {pkg.dependencies && pkg.dependencies.length > 0 && (
                      <p className="text-sm">
                        <span className="font-semibold">Dependencies:</span> {pkg.dependencies.join(', ')}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {/* Technical Specifications */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold">Technical Specifications</h3>

        {scopeOfWork.technical_specifications.standards.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Standards</h4>
            <ul className="space-y-1 text-sm">
              {scopeOfWork.technical_specifications.standards.map((std, idx) => (
                <li key={idx} className="text-muted-foreground">• {std}</li>
              ))}
            </ul>
          </div>
        )}

        {scopeOfWork.technical_specifications.quality_requirements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Quality Requirements</h4>
            <ul className="space-y-1 text-sm">
              {scopeOfWork.technical_specifications.quality_requirements.map((req, idx) => (
                <li key={idx} className="text-muted-foreground">• {req}</li>
              ))}
            </ul>
          </div>
        )}

        {scopeOfWork.technical_specifications.materials_specification.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Materials Specification</h4>
            <div className="space-y-2 text-sm">
              {scopeOfWork.technical_specifications.materials_specification.map((mat, idx) => (
                <div key={idx} className="p-3 bg-muted rounded">
                  <p className="font-medium">{mat.material}</p>
                  <p className="text-muted-foreground text-xs">{mat.specification}</p>
                  {mat.source && (
                    <p className="text-muted-foreground text-xs">Source: {mat.source}</p>
                  )}
                  {mat.testing_standard && (
                    <p className="text-muted-foreground text-xs">Testing: {mat.testing_standard}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Deliverables */}
      {scopeOfWork.deliverables.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Deliverables</h3>
          <ul className="space-y-3 text-sm">
            {scopeOfWork.deliverables.map((del, idx) => (
              <li key={idx} className="p-3 bg-muted rounded">
                <p className="font-medium">{del.item}</p>
                <p className="text-muted-foreground text-xs">{del.description}</p>
                {del.timeline && (
                  <p className="text-muted-foreground text-xs mt-1">Timeline: {del.timeline}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Exclusions */}
      {scopeOfWork.exclusions && scopeOfWork.exclusions.length > 0 && (
        <Card className="p-6 space-y-4 border-orange-200 bg-orange-50">
          <h3 className="text-xl font-bold">Exclusions</h3>
          <ul className="space-y-1 text-sm">
            {scopeOfWork.exclusions.map((excl, idx) => (
              <li key={idx} className="text-orange-900">• {excl}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
