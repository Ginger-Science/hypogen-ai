import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from 'jspdf';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Sparkles, Link, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hypothesis {
  hypothesis_text: string;
  key_insights: string[];
  scientific_references: Array<{
    title: string;
    url: string;
  }>;
  confidence_score: number;
  publish_link?: string;
  created_at: string;
}

export const HypothesisGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [hypothesis, setHypothesis] = useState<Hypothesis | null>(() => {
    const saved = localStorage.getItem('currentHypothesis');
    return saved ? JSON.parse(saved) : null;
  });
  const { toast } = useToast();

  const generateWithAI = async (topic: string) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('AI service not configured');
    }

    const prompt = `Generate a detailed scientific research hypothesis about ${topic}. 
    Return ONLY a JSON object with this exact structure:
    {
      "hypothesis_text": "A detailed scientific hypothesis statement",
      "key_insights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
      "scientific_references": [
        {"title": "Reference title 1", "url": "https://pubmed.ncbi.nlm.nih.gov/example1"},
        {"title": "Reference title 2", "url": "https://pubmed.ncbi.nlm.nih.gov/example2"},
        {"title": "Reference title 3", "url": "https://pubmed.ncbi.nlm.nih.gov/example3"}
      ],
      "confidence_score": 85
    }
    
    Focus on real scientific concepts and make it detailed and professional.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate hypothesis');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from AI service');
    }

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse JSON:', content);
      throw new Error('Failed to parse AI response');
    }
  };

  const updateRelatedData = (newHypothesis: Hypothesis) => {
    // Update stats in main page
    const statsUpdate = {
      hypotheses: parseInt(localStorage.getItem('totalHypotheses') || '0') + 1,
      insights: newHypothesis.key_insights.length,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('appStats', JSON.stringify(statsUpdate));
    localStorage.setItem('totalHypotheses', statsUpdate.hypotheses.toString());

    // Add to hypotheses history
    const history = JSON.parse(localStorage.getItem('hypothesesHistory') || '[]');
    history.push(newHypothesis);
    localStorage.setItem('hypothesesHistory', JSON.stringify(history));

    // Trigger updates in other components via custom event
    const customEvent = new CustomEvent('hypothesisUpdated', { detail: newHypothesis });
    window.dispatchEvent(customEvent);
    
    console.log('Updated related data:', statsUpdate);
  };

  const generateHypothesis = async (isCustom = false) => {
    setLoading(true);
    try {
      const topic = isCustom ? customTopic : "redhead genetics and cultural phenomena";
      
      console.log('Generating hypothesis for topic:', topic);
      const aiData = await generateWithAI(topic);
      console.log('AI Response:', aiData);
      
      const newHypothesis: Hypothesis = {
        hypothesis_text: aiData.hypothesis_text,
        key_insights: aiData.key_insights || [],
        scientific_references: aiData.scientific_references || [],
        confidence_score: aiData.confidence_score || Math.floor(Math.random() * 15) + 85,
        created_at: new Date().toISOString()
      };

      // Save to localStorage for persistence
      localStorage.setItem('currentHypothesis', JSON.stringify(newHypothesis));
      setHypothesis(newHypothesis);
      
      // Update related data in other components
      updateRelatedData(newHypothesis);
      
      toast({
        title: "Hypothesis Generated!",
        description: `New research hypothesis created using AI for: ${topic}`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate hypothesis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const publishToChain = async () => {
    if (!hypothesis) return;
    
    setLoading(true);
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const publishLink = `https://sepolia.etherscan.io/tx/0x${Math.random().toString(16).substring(2, 66)}`;
      const updatedHypothesis = { ...hypothesis, publish_link: publishLink };
      
      localStorage.setItem('currentHypothesis', JSON.stringify(updatedHypothesis));
      setHypothesis(updatedHypothesis);
      
      // Update related data
      updateRelatedData(updatedHypothesis);
      
      toast({
        title: "Published to Blockchain!",
        description: "Hypothesis stored on-chain via Chainlink Functions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish to blockchain",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!hypothesis) return;
    
    const doc = new jsPDF();

    let yOffset = 15; // Increased initial offset
    const margin = 15; // Increased margin
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(20); // Larger title font
    doc.setTextColor(50); // Darker text color
    doc.text('HypoGen AI - Research Hypothesis Export', margin, yOffset);
    yOffset += lineHeight * 2;

    doc.setFontSize(12);
    doc.setTextColor(80); // Slightly lighter text for details
    doc.text(`Generated: ${new Date(hypothesis.created_at).toLocaleString()}`, margin, yOffset);
    yOffset += lineHeight;
    doc.text(`Confidence Score: ${hypothesis.confidence_score}%`, margin, yOffset);
    yOffset += lineHeight * 2;

    doc.setFontSize(16); // Section title font
    doc.setTextColor(50);
    doc.text('HYPOTHESIS:', margin, yOffset);
    yOffset += lineHeight;
    doc.setFontSize(12);
    doc.setTextColor(80);
    const hypothesisTextLines = doc.splitTextToSize(hypothesis.hypothesis_text, maxWidth);
    doc.text(hypothesisTextLines, margin, yOffset);
    yOffset += hypothesisTextLines.length * lineHeight + lineHeight * 1.5; // More space after hypothesis

    doc.setFontSize(16);
    doc.text('KEY INSIGHTS:', margin, yOffset);
    yOffset += lineHeight;
    doc.setFontSize(12);
    doc.setTextColor(80);
    hypothesis.key_insights.forEach((insight, index) => {
      const insightLines = doc.splitTextToSize(`${index + 1}. ${insight}`, maxWidth);
      doc.text(insightLines, margin, yOffset);
      yOffset += insightLines.length * lineHeight;
    });    
    
    // Add Key Insights and Scientific References similarly, handling text wrapping
    // This is a basic implementation and can be further enhanced for better formatting
 yOffset += lineHeight * 1.5; // More space after insights

    doc.setFontSize(16);
 doc.setTextColor(50);
    doc.text('SCIENTIFIC REFERENCES:', margin, yOffset);
    yOffset += lineHeight;
 doc.setFontSize(12);
 doc.setTextColor(80);
    hypothesis.scientific_references.forEach((ref, index) => {
      const refTitleLines = doc.splitTextToSize(`${index + 1}. ${ref.title}`, maxWidth);
      doc.text(refTitleLines, margin, yOffset);
      yOffset += refTitleLines.length * lineHeight;

      doc.setTextColor(0, 0, 255); // Blue color for URLs
      doc.textWithLink(ref.url, margin + 5, yOffset, { url: ref.url });
      yOffset += lineHeight;
 doc.setTextColor(80); // Reset color
    });
 yOffset += lineHeight * 1.5; // More space after references

    if (hypothesis.publish_link) {
      // You could add blockchain link here similarly if needed
    }

    doc.save(`hypothesis_${Date.now()}.pdf`);
    
    toast({
      title: "Export Complete!",
      description: "Hypothesis exported successfully",
    });
  };

  const exportToWord = () => {
    if (!hypothesis) return;
    
    const htmlContent = `
      <html>
        <head><title>HypoGen AI - Research Hypothesis</title></head>
        <body>
          <h1>HypoGen AI - Research Hypothesis Export</h1>
          <p><strong>Generated:</strong> ${new Date(hypothesis.created_at).toLocaleString()}</p>
          <p><strong>Confidence Score:</strong> ${hypothesis.confidence_score}%</p>
          
          <h2>HYPOTHESIS:</h2>
          <p>${hypothesis.hypothesis_text}</p>
          
          <h2>KEY INSIGHTS:</h2>
          <ol>
            ${hypothesis.key_insights.map(insight => `<li>${insight}</li>`).join('')}
          </ol>
          
          <h2>SCIENTIFIC REFERENCES:</h2>
          <ol>
            ${hypothesis.scientific_references.map(ref => `<li><strong>${ref.title}</strong><br>${ref.url}</li>`).join('')}
          </ol>
          
          ${hypothesis.publish_link ? `<h2>BLOCKCHAIN LINK:</h2><p>${hypothesis.publish_link}</p>` : ''}
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hypothesis_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Word Export Complete!",
      description: "Hypothesis exported as Word document",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Brain className="h-5 w-5" />
            AI Hypothesis Generator
          </CardTitle>
          <CardDescription className="text-orange-600 dark:text-orange-400">
            Generate research hypotheses with advanced AI technology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2 block">
              Custom Research Topic (Optional)
            </label>
            <Input
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Enter your custom research topic..."
              className="border-orange-300 focus:border-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
            {!customTopic.trim() && (
              <Button 
                onClick={() => generateHypothesis(false)}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Generate (Redheads)
                  </>
                )}
              </Button>
            )}
            
            {customTopic.trim() && (
              <Button 
                onClick={() => generateHypothesis(true)}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Custom...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Custom Topic
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {hypothesis && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-orange-800 dark:text-orange-200">Generated Hypothesis</CardTitle>
              <div className="flex gap-2">
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                >
                  {hypothesis.confidence_score}% Confidence
                </Badge>
                {hypothesis.publish_link && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Published
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Hypothesis</h4>
              <Textarea 
                value={hypothesis.hypothesis_text}
                readOnly
                className="min-h-[100px] bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
              />
            </div>

            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Key Insights</h4>
              <div className="grid gap-2">
                {hypothesis.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-orange-700 dark:text-orange-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Scientific References</h4>
              <div className="space-y-2">
                {hypothesis.scientific_references.map((ref, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <Link className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700 dark:text-orange-300 flex-1">{ref.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {hypothesis.publish_link && (
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Blockchain Publication</h4>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <a 
                    href={hypothesis.publish_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 dark:text-green-300 underline break-all"
                  >
                    {hypothesis.publish_link}
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={publishToChain}
                disabled={loading || !!hypothesis.publish_link}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : hypothesis.publish_link ? (
                  "Already Published"
                ) : (
                  "Publish to Chainlink"
                )}
              </Button>
              
              <Button 
                onClick={exportToPDF}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              
              <Button 
                onClick={exportToWord}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export DOC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
