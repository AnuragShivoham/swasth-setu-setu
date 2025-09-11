import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PhotoDiagnosis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const onAnalyze = async () => {
    if (!preview) {
      toast({ title: "No image selected", description: "Please upload a clear photo." });
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("analyze-medical-image", {
        body: { image: preview },
      });
      if (error) throw error;
      setResult(data?.analysis || "No details returned.");
      toast({ title: "Analysis complete", description: "Review suggested observations." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Analysis failed", description: err.message || "Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Photo Diagnosis (Beta)</CardTitle>
        <CardDescription>
          Upload a clear photo of the affected area. The AI will highlight visible signs and suggest next steps. Not a medical diagnosis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <Input type="file" accept="image/*" onChange={onSelect} />
          <Button onClick={onAnalyze} disabled={!preview || loading} variant="medical">
            {loading ? "Analyzing..." : "Analyze Photo"}
          </Button>
        </div>
        {preview && (
          <img src={preview} alt="Uploaded clinical photo" className="max-h-80 rounded-lg border" loading="lazy" />
        )}
        {result && (
          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-semibold mb-2">AI Observations</h4>
            <p className="text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoDiagnosis;
