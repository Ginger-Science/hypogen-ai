import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Trophy, Award, Star, Crown, Zap, Lock } from "lucide-react";

interface NFTBadge {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  icon: React.ReactNode;
  chainlinkFeature: string;
}

export const NFTBadges = () => {
  const badges: NFTBadge[] = [
    {
      id: 'hypothesis_creator',
      name: 'Hypothesis Creator',
      description: 'Generated your first AI hypothesis',
      rarity: 'common',
      earned: true,
      icon: <Trophy className="h-6 w-6" />,
      chainlinkFeature: 'Functions'
    },
    {
      id: 'data_explorer',
      name: 'Data Explorer',
      description: 'Analyzed 10+ knowledge connections',
      rarity: 'rare',
      earned: true,
      icon: <Award className="h-6 w-6" />,
      chainlinkFeature: 'Automation'
    },
    {
      id: 'chain_publisher',
      name: 'Chain Publisher',
      description: 'Published research to blockchain',
      rarity: 'epic',
      earned: true,
      icon: <Star className="h-6 w-6" />,
      chainlinkFeature: 'CCIP'
    },
    {
      id: 'research_master',
      name: 'Research Master',
      description: 'Completed 50 hypothesis validations',
      rarity: 'legendary',
      earned: false,
      icon: <Crown className="h-6 w-6" />,
      chainlinkFeature: 'VRF'
    },
    {
      id: 'vrf_lucky',
      name: 'Lucky Researcher',
      description: 'Won rare insight through VRF randomness',
      rarity: 'epic',
      earned: false,
      icon: <Zap className="h-6 w-6" />,
      chainlinkFeature: 'VRF'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getChainlinkColor = (feature: string) => {
    switch (feature) {
      case 'Functions': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Automation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CCIP': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'VRF': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Trophy className="h-5 w-5" />
            NFT Research Badges
          </CardTitle>
          <CardDescription className="text-orange-600 dark:text-orange-400">
            Earn unique NFT badges for your research contributions powered by Chainlink
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <Card 
                key={badge.id} 
                className={`border transition-all duration-300 ${
                  badge.earned 
                    ? 'border-orange-200 dark:border-orange-800 shadow-md' 
                    : 'border-gray-200 dark:border-gray-800 opacity-75'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    badge.earned 
                      ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {badge.earned ? badge.icon : <Lock className="h-6 w-6" />}
                  </div>
                  
                  <h3 className={`font-semibold mb-2 ${
                    badge.earned 
                      ? 'text-orange-800 dark:text-orange-200' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {badge.name}
                  </h3>
                  
                  <p className={`text-sm mb-3 ${
                    badge.earned 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {badge.description}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getRarityColor(badge.rarity)}
                    >
                      {badge.rarity.toUpperCase()}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getChainlinkColor(badge.chainlinkFeature)}
                    >
                      {badge.chainlinkFeature}
                    </Badge>
                  </div>
                  
                  {badge.earned && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
                    >
                      View on OpenSea
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200">Badge Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-orange-600 dark:text-orange-400">Badges Earned</span>
              <span className="font-medium text-orange-800 dark:text-orange-200">
                3 / {badges.length}
              </span>
            </div>
            <div className="w-full bg-orange-100 dark:bg-orange-900 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(badges.filter(b => b.earned).length / badges.length) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-lg font-bold text-orange-800 dark:text-orange-200">60%</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Completion Rate</div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-lg font-bold text-orange-800 dark:text-orange-200">1,250</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Research Points</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
