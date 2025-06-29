"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Network, Users, Dna, Brain, Palette, RefreshCw, AlertCircle, Zap, Target, Link2, GitBranch, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'gene' | 'trait' | 'population' | 'method' | 'finding' | 'hypothesis' | 'chain';
  connections: string[];
  strength: number;
  description?: string;
  chainLevel?: number;
  parentChain?: string;
}

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

interface ChainConnection {
  from: string;
  to: string;
  relationship: string;
  strength: number;
}

export const KnowledgeGraph = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [chains, setChains] = useState<ChainConnection[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [hasHypothesis, setHasHypothesis] = useState(false);
  const [graphStats, setGraphStats] = useState({
    totalNodes: 0,
    totalConnections: 0,
    strongestChain: '',
    avgStrength: 0
  });

  const extractEnhancedNodesFromHypothesis = (hypothesis: Hypothesis): { nodes: GraphNode[], chains: ChainConnection[] } => {
    console.log('Extracting enhanced chain-type knowledge graph from hypothesis:', hypothesis);
    
    const dynamicNodes: GraphNode[] = [];
    const chainConnections: ChainConnection[] = [];
    const text = hypothesis.hypothesis_text.toLowerCase();
    const insights = hypothesis.key_insights;
    
    // Create main hypothesis node
    const mainNodeId = 'main_hypothesis';
    dynamicNodes.push({
      id: mainNodeId,
      label: 'Research Hypothesis',
      type: 'hypothesis',
      connections: [],
      strength: hypothesis.confidence_score,
      description: hypothesis.hypothesis_text.substring(0, 120) + '...',
      chainLevel: 0
    });

    // Enhanced concept extraction with chain relationships
    const conceptChains = {
      'genetic_chain': ['genetic', 'gene', 'dna', 'genome', 'allele', 'mutation'],
      'population_chain': ['population', 'people', 'demographic', 'ethnic', 'ancestry', 'group'],
      'cognitive_chain': ['cognitive', 'brain', 'neural', 'memory', 'learning', 'intelligence'],
      'behavioral_chain': ['behavior', 'trait', 'personality', 'social', 'cultural', 'adaptation'],
      'research_chain': ['study', 'analysis', 'research', 'method', 'experiment', 'data']
    };

    // Process each chain and create hierarchical nodes
    Object.entries(conceptChains).forEach(([chainName, keywords], chainIndex) => {
      let chainFound = false;
      let chainNodes: GraphNode[] = [];
      
      keywords.forEach((keyword, keywordIndex) => {
        if (text.includes(keyword)) {
          chainFound = true;
          const nodeId = `${chainName}_${keyword}`;
          const nodeType = getNodeTypeFromChain(chainName);
          
          const node: GraphNode = {
            id: nodeId,
            label: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            type: nodeType,
            connections: [mainNodeId],
            strength: Math.max(60, hypothesis.confidence_score - 10 + Math.floor(Math.random() * 20)),
            chainLevel: keywordIndex + 1,
            parentChain: chainName
          };
          
          chainNodes.push(node);
          dynamicNodes.push(node);
          if (dynamicNodes[0]) {
            dynamicNodes[0].connections.push(nodeId);
          }
          
          // Create chain connections
          if (keywordIndex > 0) {
            const prevNodeId = `${chainName}_${keywords[keywordIndex - 1]}`;
            chainConnections.push({
              from: prevNodeId,
              to: nodeId,
              relationship: 'leads_to',
              strength: Math.floor(Math.random() * 30) + 70
            });
          }
        }
      });
      
      // Connect chain to main hypothesis
      if (chainFound && chainNodes.length > 0) {
        chainConnections.push({
          from: mainNodeId,
          to: chainNodes[0].id,
          relationship: 'influences',
          strength: Math.floor(Math.random() * 25) + 75
        });
      }
    });

    // Create insight-based chain nodes
    insights.forEach((insight, index) => {
      if (index < 5) {
        const words = insight.split(' ').filter(word => word.length > 4);
        const keyTerms = words.slice(0, 3);
        
        keyTerms.forEach((term, termIndex) => {
          const nodeId = `insight_${index}_${term.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          
          if (!dynamicNodes.find(n => n.id === nodeId)) {
            const nodeType = determineNodeTypeFromInsight(insight);
            
            dynamicNodes.push({
              id: nodeId,
              label: term.charAt(0).toUpperCase() + term.slice(1),
              type: nodeType,
              connections: [mainNodeId],
              strength: Math.max(65, hypothesis.confidence_score - 5 + Math.floor(Math.random() * 15)),
              description: insight.substring(0, 90) + '...',
              chainLevel: termIndex + 1,
              parentChain: `insight_chain_${index}`
            });
            
            if (dynamicNodes[0]) {
              dynamicNodes[0].connections.push(nodeId);
            }
            
            // Create insight chain connections
            if (termIndex > 0) {
              const prevTerm = keyTerms[termIndex - 1];
              const prevNodeId = `insight_${index}_${prevTerm.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
              chainConnections.push({
                from: prevNodeId,
                to: nodeId,
                relationship: 'supports',
                strength: Math.floor(Math.random() * 20) + 80
              });
            }
          }
        });
      }
    });

    // Create cross-chain connections (interdisciplinary relationships)
    const nodesByType = dynamicNodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, GraphNode[]>);

    // Connect related node types with cross-chain relationships
    if (nodesByType.gene && nodesByType.trait) {
      nodesByType.gene.forEach(geneNode => {
        const compatibleTrait = nodesByType.trait?.find(t => Math.random() > 0.7);
        if (compatibleTrait) {
          chainConnections.push({
            from: geneNode.id,
            to: compatibleTrait.id,
            relationship: 'expresses_as',
            strength: Math.floor(Math.random() * 30) + 70
          });
        }
      });
    }

    if (nodesByType.population && nodesByType.concept) {
      nodesByType.population.forEach(popNode => {
        const compatibleConcept = nodesByType.concept?.find(c => Math.random() > 0.6);
        if (compatibleConcept) {
          chainConnections.push({
            from: popNode.id,
            to: compatibleConcept.id,
            relationship: 'characterized_by',
            strength: Math.floor(Math.random() * 25) + 75
          });
        }
      });
    }

    console.log('Generated enhanced chain-type knowledge graph:', { nodes: dynamicNodes, chains: chainConnections });
    return { nodes: dynamicNodes, chains: chainConnections };
  };

  const getNodeTypeFromChain = (chainName: string): GraphNode['type'] => {
    const typeMap: Record<string, GraphNode['type']> = {
      'genetic_chain': 'gene',
      'population_chain': 'population',
      'cognitive_chain': 'trait',
      'behavioral_chain': 'trait',
      'research_chain': 'method'
    };
    return typeMap[chainName] || 'concept';
  };

  const determineNodeTypeFromInsight = (insight: string): GraphNode['type'] => {
    const insightLower = insight.toLowerCase();
    
    if (insightLower.includes('gene') || insightLower.includes('genetic') || insightLower.includes('dna')) {
      return 'gene';
    } else if (insightLower.includes('population') || insightLower.includes('people') || insightLower.includes('group')) {
      return 'population';
    } else if (insightLower.includes('behavior') || insightLower.includes('trait') || insightLower.includes('cognitive')) {
      return 'trait';
    } else if (insightLower.includes('method') || insightLower.includes('analysis') || insightLower.includes('study')) {
      return 'method';
    } else {
      return 'finding';
    }
  };

  const calculateGraphStats = (nodes: GraphNode[], chains: ChainConnection[]) => {
    const totalNodes = nodes.length;
    const totalConnections = chains.length + nodes.reduce((sum, node) => sum + node.connections.length, 0);
    const avgStrength = nodes.length > 0 ? nodes.reduce((sum, node) => sum + node.strength, 0) / nodes.length : 0;
    
    const strongestChain = chains.length > 0 ? chains.reduce((strongest, chain) => 
      chain.strength > strongest.strength ? chain : strongest, 
      chains[0]
    ) : { strength: 0, from: '', to: '', relationship: '' };

    return {
      totalNodes,
      totalConnections,
      strongestChain: strongestChain.relationship || 'None',
      avgStrength: Math.round(avgStrength)
    };
  };

  const refreshData = () => {
    if (typeof window !== "undefined") {
      const currentHypothesis = localStorage.getItem('currentHypothesis');
      if (currentHypothesis) {
        const hypothesis = JSON.parse(currentHypothesis);
        const { nodes: newNodes, chains: newChains } = extractEnhancedNodesFromHypothesis(hypothesis);
        setNodes(newNodes);
        setChains(newChains);
        setHasHypothesis(true);
        setLastUpdate(new Date().toISOString());
        
        // Save to localStorage for persistence
        localStorage.setItem('knowledgeGraphData', JSON.stringify({ nodes: newNodes, chains: newChains }));
        localStorage.setItem('knowledgeGraphUpdate', new Date().toISOString());
        
        const stats = calculateGraphStats(newNodes, newChains);
        setGraphStats(stats);
      } else {
        // Load from localStorage if no current hypothesis
        const savedData = localStorage.getItem('knowledgeGraphData');
        if (savedData) {
          const { nodes: savedNodes, chains: savedChains } = JSON.parse(savedData);
          setNodes(savedNodes);
          setChains(savedChains);
          setHasHypothesis(true);
          setLastUpdate(localStorage.getItem('knowledgeGraphUpdate') || '');
          const stats = calculateGraphStats(savedNodes, savedChains);
          setGraphStats(stats);
        }
      }
    }
  };

  useEffect(() => {
    const handleHypothesisUpdate = (event: any) => {
      console.log('Knowledge graph received hypothesis update:', event.detail);
      const { nodes: newNodes, chains: newChains } = extractEnhancedNodesFromHypothesis(event.detail);
      setNodes(newNodes);
      setChains(newChains);
      setLastUpdate(new Date().toISOString());
      setHasHypothesis(true);
      calculateGraphStats(newNodes, newChains);
      localStorage.setItem('knowledgeGraphData', JSON.stringify({ nodes: newNodes, chains: newChains }));
      localStorage.setItem('knowledgeGraphUpdate', new Date().toISOString());
    };

    window.addEventListener('hypothesisUpdated', handleHypothesisUpdate);

    // Initial load
    if (typeof window !== "undefined") {
      const currentHypothesis = localStorage.getItem('currentHypothesis');
      if (currentHypothesis) {
        const hypothesis = JSON.parse(currentHypothesis);
        const { nodes: newNodes, chains: newChains } = extractEnhancedNodesFromHypothesis(hypothesis);
        setNodes(newNodes);
        setChains(newChains);
        setHasHypothesis(true);
        setLastUpdate(hypothesis.created_at);
        calculateGraphStats(newNodes, newChains);
      }
    }

    return () => {
      window.removeEventListener('hypothesisUpdated', handleHypothesisUpdate);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'gene': return <Dna className="h-5 w-5" />;
      case 'population': return <Users className="h-5 w-5" />;
      case 'trait': return <Brain className="h-5 w-5" />;
      case 'concept': return <Palette className="h-5 w-5" />;
      case 'method': return <Target className="h-5 w-5" />;
      case 'finding': return <Eye className="h-5 w-5" />;
      case 'hypothesis': return <Zap className="h-6 w-6" />;
      case 'chain': return <GitBranch className="h-5 w-5" />;
      default: return <Network className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gene': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';
      case 'population': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300';
      case 'trait': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300';
      case 'concept': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300';
      case 'method': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300';
      case 'finding': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-300';
      case 'hypothesis': return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 dark:from-orange-900 dark:to-red-900 dark:text-orange-200 border-orange-300';
      case 'chain': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border-teal-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-300';
    }
  };

  const getChainLevelColor = (level?: number) => {
    if (!level) return '';
    const colors = [
      'bg-orange-50 border-l-4 border-orange-400',
      'bg-blue-50 border-l-4 border-blue-400',
      'bg-green-50 border-l-4 border-green-400',
      'bg-purple-50 border-l-4 border-purple-400',
      'bg-pink-50 border-l-4 border-pink-400'
    ];
    return colors[level % colors.length] || colors[0];
  };

  if (!hasHypothesis) {
    return (
      <div className="space-y-6">
        <Card className="border-orange-200 dark:border-orange-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-800 dark:text-orange-200 text-2xl">
              <Network className="h-8 w-8" />
              Advanced Chain-Type Knowledge Graph
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-400 text-lg">
              Real-time hierarchical connections and interdisciplinary relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-orange-800 dark:text-orange-200 text-lg">
                No hypothesis generated yet. Go to the Generate tab to create your first hypothesis and see the advanced knowledge graph visualization!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400 text-lg">Building advanced chain-type knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Stats */}
      <Card className="border-orange-200 dark:border-orange-800 shadow-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-orange-800 dark:text-orange-200 text-2xl mb-2">
                <Network className="h-8 w-8" />
                Advanced Chain-Type Knowledge Graph
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400 text-lg">
                Hierarchical knowledge mapping with interdisciplinary connections
              </CardDescription>
              {lastUpdate && (
                <p className="text-sm text-orange-500 dark:text-orange-400 mt-2">
                  Last updated: {new Date(lastUpdate).toLocaleString()}
                </p>
              )}
              
              {/* Graph Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{graphStats.totalNodes}</div>
                  <div className="text-xs text-orange-500 dark:text-orange-400">Nodes</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{graphStats.totalConnections}</div>
                  <div className="text-xs text-blue-500 dark:text-blue-400">Connections</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{graphStats.avgStrength}%</div>
                  <div className="text-xs text-green-500 dark:text-green-400">Avg Strength</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{chains.length}</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400">Chain Links</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={refreshData}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20 px-6 py-3"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Graph
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Chain Connections Visualization */}
      {chains.length > 0 && (
        <Card className="border-teal-200 dark:border-teal-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
              <Link2 className="h-6 w-6" />
              Chain Relationships ({chains.length})
            </CardTitle>
            <CardDescription className="text-teal-600 dark:text-teal-400">Interdisciplinary connections and knowledge flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chains.slice(0, 9).map((chain, index) => (
                <div key={index} className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs border-teal-300 text-teal-700 dark:border-teal-600 dark:text-teal-300">
                      {chain.relationship.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{chain.strength}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-teal-800 dark:text-teal-200 truncate">
                      {nodes.find(n => n.id === chain.from)?.label || chain.from}
                    </span>
                    <span className="text-teal-500 dark:text-teal-400">→</span>
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-teal-800 dark:text-teal-200 truncate">
                      {nodes.find(n => n.id === chain.to)?.label || chain.to}
                    </span>
                  </div>
                  <Progress value={chain.strength} className="h-2 mt-2 bg-teal-100 dark:bg-teal-900" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Node Grid with Chain Hierarchy - FIXED DARK MODE COLORS */}
      <Card className="border-orange-200 dark:border-orange-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200 text-xl">
            Knowledge Nodes & Chain Hierarchy
          </CardTitle>
          <CardDescription className="text-orange-600 dark:text-orange-400">Organized by knowledge chains and interdisciplinary relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nodes.map((node) => (
              <Card 
                key={node.id} 
                className={`${getChainLevelColor(node.chainLevel)} hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${node.type === 'hypothesis' ? 'col-span-full sm:col-span-2 lg:col-span-1' : ''} dark:bg-gray-800/50`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${getTypeColor(node.type)} border-2`}>
                        {getIcon(node.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                          {node.label}
                        </h4>
                        {node.chainLevel && (
                          <Badge variant="outline" className="text-xs mt-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            Chain Level {node.chainLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getTypeColor(node.type)} text-xs px-2 py-1`}
                    >
                      {node.type}
                    </Badge>
                  </div>
                  
                  {node.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {node.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Strength</span>
                      <span className="font-bold text-gray-800 dark:text-gray-100">{node.strength}%</span>
                    </div>
                    <Progress 
                      value={node.strength} 
                      className="h-3 bg-gray-100 dark:bg-gray-700"
                    />
                    
                    {node.parentChain && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Chain:</span>
                        <Badge variant="outline" className="ml-2 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {node.parentChain.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300">Connections ({node.connections.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {node.connections.slice(0, 3).map((connection) => (
                          <Badge 
                            key={connection} 
                            variant="outline" 
                            className="text-xs border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                          >
                            {connection.replace('_', ' ').replace('main hypothesis', 'Core')}
                          </Badge>
                        ))}
                        {node.connections.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                            +{node.connections.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Graph Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-emerald-200 dark:border-emerald-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Chain Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Strongest Connection</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {chains.length > 0 ? (
                    <>
                      {chains.reduce((strongest, chain) => 
                        chain.strength > strongest.strength ? chain : strongest, 
                        chains[0]
                      ).relationship.replace(/_/g, ' ')} 
                      ({chains.reduce((max, chain) => Math.max(max, chain.strength), 0)}% strength)
                    </>
                  ) : (
                    'No chain connections yet'
                  )}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Most Connected Node</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {nodes.length > 0 && (
                    <>
                      {nodes.reduce((prev, current) => 
                        (prev.connections.length > current.connections.length) ? prev : current
                      ).label}
                      ({nodes.reduce((prev, current) => 
                        (prev.connections.length > current.connections.length) ? prev : current
                      ).connections.length} connections)
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Knowledge Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                nodes.reduce((acc, node) => {
                  acc[node.type] = (acc[node.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(type)}
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200 capitalize">
                      {type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-blue-100 dark:bg-blue-900 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / nodes.length) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
