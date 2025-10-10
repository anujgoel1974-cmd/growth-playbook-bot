import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Loader2, Package, ExternalLink, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductLink {
  url: string;
  title: string;
  imageUrl?: string;
}

interface Subcategory {
  name: string;
  products: ProductLink[];
}

interface Category {
  name: string;
  subcategories: Subcategory[];
}

interface SitemapData {
  homepageUrl: string;
  totalProducts: number;
  categories: Category[];
  extractedAt: string;
}

const Sitemap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sitemap, setSitemap] = useState<SitemapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const homepageUrl = searchParams.get("url");

  useEffect(() => {
    if (!homepageUrl) {
      toast({
        title: "Missing URL",
        description: "Please provide a homepage URL",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const extractSitemap = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('extract-sitemap', {
          body: { url: homepageUrl }
        });

        if (error) throw error;

        if (!data.success) {
          throw new Error(data.error || "Failed to extract sitemap");
        }

        setSitemap(data.sitemap);
      } catch (error: any) {
        console.error("Sitemap extraction error:", error);
        toast({
          title: "Extraction Failed",
          description: error.message || "Could not extract product catalog from this URL",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    extractSitemap();
  }, [homepageUrl, navigate, toast]);

  const analyzeProduct = (productUrl: string) => {
    navigate(`/results?url=${encodeURIComponent(productUrl)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="w-full max-w-md shadow-card-hover">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h3 className="text-xl font-semibold">Extracting Product Catalog...</h3>
            <p className="text-sm text-muted-foreground">
              This may take 30-90 seconds depending on catalog size
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sitemap) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Failed to load sitemap</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover-scale">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Catalog</h1>
            <p className="text-muted-foreground">{new URL(sitemap.homepageUrl).hostname}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{sitemap.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <FolderTree className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{sitemap.categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {sitemap.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Subcategories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Accordion */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sitemap.categories.map((category, catIdx) => (
                <AccordionItem key={catIdx} value={`category-${catIdx}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary transition-colors">
                    {category.name} ({category.subcategories.reduce((sum, sub) => sum + sub.products.length, 0)} products)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      {category.subcategories.map((subcategory, subIdx) => (
                        <div key={subIdx}>
                          <h4 className="font-semibold mb-3 text-md text-foreground/90">{subcategory.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subcategory.products.map((product, prodIdx) => (
                              <Card key={prodIdx} className="hover:shadow-lg transition-all hover-scale">
                                <CardContent className="pt-6 space-y-3">
                                  <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.title}</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                                      onClick={() => analyzeProduct(product.url)}
                                    >
                                      Analyze
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(product.url, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sitemap;
