import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Save, ExternalLink, RefreshCw, BookOpen, Loader2 } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";

interface SearchDoc {
  tid: string;
  title: string;
  headline: string;
  docsource: string;
  date: string;
}

interface LegalResearchUIProps {
  searchQuery: string;
  hasSearched: boolean;
  searchResults: SearchDoc[];
  totalResults: number;
  isLoading: boolean;
  isLoadingMore?: boolean;
  savingCaseId?: string | null;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onLoadMore?: () => void;
  onSaveToCase: (result: SearchDoc) => void;
}

export function LegalResearchUI({
  searchQuery,
  hasSearched,
  searchResults,
  totalResults,
  isLoading,
  isLoadingMore = false,
  savingCaseId = null,
  onSearchQueryChange,
  onSearch,
  onLoadMore,
  onSaveToCase,
}: LegalResearchUIProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/ceigalliq" />
          <h1 className="text-3xl font-bold text-foreground mb-2 mt-2">Legal Research</h1>
          <p className="text-muted-foreground">
            Search and analyze legal precedents from Indian Kanoon
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-md sticky top-4 z-10 backdrop-blur-sm bg-background/80">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for case laws, statutes, or legal topics..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
            <Button size="lg" className="gap-2 h-12" onClick={onSearch} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {isLoading
                ? "Searching..."
                : `Showing ${searchResults.length} of ${totalResults} results for "${searchQuery}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card key={result.tid} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-primary hover:underline cursor-pointer pr-4">
                          {result.title}
                        </CardTitle>
                        <Badge variant="outline">{result.docsource}</Badge>
                      </div>
                      {result.date && (
                        <CardDescription>
                          Decided on: {new Date(result.date).toLocaleDateString('en-CA')}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p
                        className="text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: result.headline }}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Full Text
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => onSaveToCase(result)}
                        disabled={savingCaseId === result.tid}
                      >
                        {savingCaseId === result.tid ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save to Case
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}


              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg font-medium">No results found</p>
                <p className="text-muted-foreground">Try a different search query.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Start Your Legal Research
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter keywords, case names, or legal issues to find relevant judgments,
              acts, and legal precedents from courts across India.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button at bottom of page (in-flow) */}
      {hasSearched && searchResults.length > 0 && searchResults.length < totalResults && onLoadMore && (
        <div className="flex justify-center py-8">
          <Button onClick={onLoadMore} disabled={isLoadingMore} className="gap-2" data-testid="load-more-inline">
            {isLoadingMore ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      )}


    </div>
  );
}
