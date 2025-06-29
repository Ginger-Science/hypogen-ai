"use client";

import { useState, useEffect } from "react";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Textarea } from "~~/components/ui/textarea";
import { Badge } from "~~/components/ui/badge";
import { Alert, AlertDescription } from "~~/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Award } from "lucide-react";

interface Hypothesis {
  content: string;
  metadata: string;
  researcher: string;
  timestamp: number;
  isValidated: boolean;
  validationScore: number;
  validationResult: string;
}

export function ChainlinkHypothesisValidator() {
  const { address } = useAccount();
  const [hypothesisContent, setHypothesisContent] = useState("");
  const [hypothesisMetadata, setHypothesisMetadata] = useState("");
  const [userHypotheses, setUserHypotheses] = useState<number[]>([]);
  const [hypothesisDetails, setHypothesisDetails] = useState<Hypothesis[]>([]);
  const [badgeTypes, setBadgeTypes] = useState<string[]>([]);

  const { data: chainlinkValidator } = useScaffoldContract({
    contractName: "ChainlinkHypothesisValidator",
  });

  // Read user's hypotheses
  const { data: userHypothesesData, refetch: refetchUserHypotheses } = useScaffoldContractRead({
    contractName: "ChainlinkHypothesisValidator",
    functionName: "getResearcherHypotheses",
    args: [address],
  });

  // Read badge types
  const { data: badgeTypesData } = useScaffoldContractRead({
    contractName: "ChainlinkHypothesisValidator",
    functionName: "getBadgeTypes",
  });

  // Write functions
  const { writeAsync: submitHypothesis, isLoading: isSubmitting } = useScaffoldContractWrite({
    contractName: "ChainlinkHypothesisValidator",
    functionName: "submitHypothesis",
  });

  const { writeAsync: requestBadge, isLoading: isRequestingBadge } = useScaffoldContractWrite({
    contractName: "ChainlinkHypothesisValidator",
    functionName: "requestBadgeAssignment",
  });

  // Update state when data changes
  useEffect(() => {
    if (userHypothesesData) {
      setUserHypotheses(userHypothesesData);
    }
  }, [userHypothesesData]);

  useEffect(() => {
    if (badgeTypesData) {
      setBadgeTypes(badgeTypesData);
    }
  }, [badgeTypesData]);

  // Fetch hypothesis details
  useEffect(() => {
    const fetchHypothesisDetails = async () => {
      if (!chainlinkValidator || userHypotheses.length === 0) return;

      const details: Hypothesis[] = [];
      for (const hypothesisId of userHypotheses) {
        try {
          const hypothesis = await chainlinkValidator.getHypothesis(hypothesisId);
          details.push({
            content: hypothesis.content,
            metadata: hypothesis.metadata,
            researcher: hypothesis.researcher,
            timestamp: Number(hypothesis.timestamp),
            isValidated: hypothesis.isValidated,
            validationScore: Number(hypothesis.validationScore),
            validationResult: hypothesis.validationResult,
          });
        } catch (error) {
          console.error("Error fetching hypothesis details:", error);
        }
      }
      setHypothesisDetails(details);
    };

    fetchHypothesisDetails();
  }, [chainlinkValidator, userHypotheses]);

  const handleSubmitHypothesis = async () => {
    if (!hypothesisContent.trim()) return;

    try {
      await submitHypothesis({
        args: [hypothesisContent, hypothesisMetadata],
      });
      setHypothesisContent("");
      setHypothesisMetadata("");
      refetchUserHypotheses();
    } catch (error) {
      console.error("Error submitting hypothesis:", error);
    }
  };

  const handleRequestBadge = async (hypothesisId: number) => {
    try {
      await requestBadge({
        args: [BigInt(hypothesisId)],
      });
    } catch (error) {
      console.error("Error requesting badge:", error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Chainlink Hypothesis Validator
          </CardTitle>
          <CardDescription>
            Submit research hypotheses for AI-powered validation using Chainlink services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hypothesis Content</label>
            <Textarea
              placeholder="Enter your research hypothesis..."
              value={hypothesisContent}
              onChange={(e) => setHypothesisContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Metadata (IPFS hash, etc.)</label>
            <Input
              placeholder="Optional metadata..."
              value={hypothesisMetadata}
              onChange={(e) => setHypothesisMetadata(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSubmitHypothesis} 
            disabled={isSubmitting || !hypothesisContent.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Hypothesis"
            )}
          </Button>
        </CardContent>
      </Card>

      {userHypotheses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Hypotheses</CardTitle>
            <CardDescription>
              Track the validation status of your submitted hypotheses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hypothesisDetails.map((hypothesis, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{hypothesis.content}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted: {formatTimestamp(hypothesis.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hypothesis.isValidated ? (
                        hypothesis.validationScore >= 75 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      )}
                    </div>
                  </div>

                  {hypothesis.isValidated && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Validation Score:</span>
                        <Badge className={getScoreColor(hypothesis.validationScore)}>
                          {hypothesis.validationScore}/100
                        </Badge>
                        <Badge variant={hypothesis.validationResult === "APPROVED" ? "default" : "destructive"}>
                          {hypothesis.validationResult}
                        </Badge>
                      </div>
                      
                      {hypothesis.validationScore >= 75 && (
                        <Button
                          size="sm"
                          onClick={() => handleRequestBadge(userHypotheses[index])}
                          disabled={isRequestingBadge}
                        >
                          {isRequestingBadge ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Requesting Badge...
                            </>
                          ) : (
                            <>
                              <Award className="mr-2 h-3 w-3" />
                              Request Badge
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {hypothesis.metadata && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Metadata:</span> {hypothesis.metadata}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {badgeTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Badge Types</CardTitle>
            <CardDescription>
              Badges are randomly assigned using Chainlink VRF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badgeTypes.map((badgeType, index) => (
                <Badge key={index} variant="outline">
                  {badgeType}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>
          <strong>Chainlink Integration Features:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• <strong>VRF (Verifiable Random Function):</strong> Random badge assignment</li>
            <li>• <strong>Automation:</strong> Periodic validation checks</li>
            <li>• <strong>Functions:</strong> AI-powered hypothesis validation (simulated)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
} 