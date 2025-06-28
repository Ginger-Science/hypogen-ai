
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HypothesisGenerator } from "@/components/HypothesisGenerator";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { NFTBadges } from "@/components/NFTBadges";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Brain, Sparkles, Network, Trophy, BarChart3, PieChart } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [stats, setStats] = useState({
    hypotheses: 0,
    connections: 8,
    badges: 5,
    insights: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const loadStats = () => {
      const savedStats = localStorage.getItem('appStats');
      const totalHypotheses = localStorage.getItem('totalHypotheses');
      const currentHypothesis = localStorage.getItem('currentHypothesis');
      
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats({
          hypotheses: parseInt(totalHypotheses || '0'),
          connections: 8 + Math.floor(parsed.hypotheses * 0.5), // Dynamic connections
          badges: 5,
          insights: parsed.insights || 0
        });
      } else if (currentHypothesis) {
        const hypothesis = JSON.parse(currentHypothesis);
        setStats({
          hypotheses: 1,
          connections: 8 + Math.floor(hypothesis.key_insights.length * 0.3),
          badges: 5,
          insights: hypothesis.key_insights.length
        });
      }
    };

    // Initial load
    loadStats();

    // Listen for updates from other components
    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-window updates
    const handleCustomUpdate = () => {
      setTimeout(loadStats, 100); // Small delay to ensure localStorage is updated
    };
    
    window.addEventListener('storage', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-orange-900/20 safe-area-inset">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
        {/* Header - Fully Responsive */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-orange-800 dark:text-orange-200 mb-1 sm:mb-2">
              🧬 HypoGen AI
            </h1>
            <p className="text-orange-600 dark:text-orange-300 text-xs sm:text-sm lg:text-base">
              AI-Powered Research Platform on Chainlink
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs sm:text-sm px-2 py-1">
              Hackathon 2025
            </Badge>
            <ThemeToggle />
          </div>
        </div>

        {/* Dynamic Stats Cards - Mobile First Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="border-orange-200 dark:border-orange-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-200">{stats.hypotheses}</div>
              <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">Hypotheses</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 dark:border-orange-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <Network className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-200">{stats.connections}</div>
              <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">Connections</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 dark:border-orange-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-200">{stats.badges}</div>
              <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">NFT Badges</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 dark:border-orange-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-200">{stats.insights}</div>
              <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">Insights</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Responsive Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-orange-100/80 dark:bg-orange-900/50 backdrop-blur-sm h-auto p-1">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Generate</span>
              <span className="sm:hidden">Gen</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Knowledge</span>
              <span className="sm:hidden">Know</span>
            </TabsTrigger>
            <TabsTrigger 
              value="badges" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              Badges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-4 sm:mt-6">
            <HypothesisGenerator />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4 sm:mt-6">
            <AnalyticsCharts />
          </TabsContent>
          
          <TabsContent value="knowledge" className="mt-4 sm:mt-6">
            <KnowledgeGraph />
          </TabsContent>
          
          <TabsContent value="badges" className="mt-4 sm:mt-6">
            <NFTBadges />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
