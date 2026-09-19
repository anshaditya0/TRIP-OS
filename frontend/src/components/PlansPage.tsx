import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ItineraryPlan, TransportMode, WeatherType, MoodMeterConfig } from '../types';
import { generateCustomItinerary, estimateDistanceKm, calculateExhaustion } from '../utils/planGenerator';
import { DEFAULT_MOOD_METER } from './DynamicMoodMeter';
import { PlanStepperHeader, WizardStep } from './plans/PlanStepperHeader';
import { StepRoute } from './plans/StepRoute';
import { StepTravelersTransport } from './plans/StepTravelersTransport';
import { StepBudgetVibe } from './plans/StepBudgetVibe';
import { StepActivities } from './plans/StepActivities';
import { StepReview } from './plans/StepReview';
import { FinalItineraryView } from './plans/FinalItineraryView';
import { createTripApi } from '../services/api';

interface PlansPageProps {
  currentPlan: ItineraryPlan | null;
  onPlanCreated: (plan: ItineraryPlan) => void;
  onSavePlan: (plan: ItineraryPlan) => void;
  initialDestination?: string;
  weatherType: WeatherType;
}

export const PlansPage: React.FC<PlansPageProps> = ({
  currentPlan,
  onPlanCreated,
  onSavePlan,
  initialDestination = '',
  weatherType,
}) => {
  // Determine initial step: if a plan already exists, show it (step 6); otherwise start at step 1
  const [currentStep, setCurrentStep] = useState<WizardStep>(currentPlan ? 6 : 1);

  // Form parameter state
  const getInitialTripDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromLocation, setFromLocation] = useState(currentPlan?.fromLocation || 'New Delhi');
  const [toLocation, setToLocation] = useState(initialDestination || currentPlan?.toLocation || 'Goa Coastline');
  const [friendsCount, setFriendsCount] = useState(currentPlan?.friendsCount || 3);
  const [budget, setBudget] = useState(currentPlan?.budget || 45000);
  const [transportMode, setTransportMode] = useState<TransportMode>(currentPlan?.transportMode || 'flight');
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    currentPlan?.preferredActivities || ['HERITAGE', 'CULINARY', 'BEACH']
  );
  const [moodMeter, setMoodMeter] = useState<MoodMeterConfig>(currentPlan?.moodMeter || DEFAULT_MOOD_METER);
  const [selectedDate, setSelectedDate] = useState<string>(currentPlan?.startDate || getInitialTripDate());
  const [durationDays, setDurationDays] = useState<number>(currentPlan?.durationDays || 3);
  const [hasBufferDayAdded, setHasBufferDayAdded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // If a new initialDestination is passed (e.g. user clicked "Plan Destination" on Home)
  useEffect(() => {
    if (initialDestination) {
      setToLocation(initialDestination);
      if (!currentPlan || !currentPlan.toLocation.toLowerCase().includes(initialDestination.toLowerCase())) {
        setCurrentStep(1);
      }
    }
  }, [initialDestination]);

  // If currentPlan changes externally (e.g. selected from Saves)
  useEffect(() => {
    if (currentPlan) {
      setFromLocation(currentPlan.fromLocation);
      setToLocation(currentPlan.toLocation);
      setFriendsCount(currentPlan.friendsCount);
      setBudget(currentPlan.budget);
      setTransportMode(currentPlan.transportMode);
      if (currentPlan.startDate) {
        setSelectedDate(currentPlan.startDate);
      }
      if (currentPlan.durationDays) {
        setDurationDays(currentPlan.durationDays);
      }
      if (currentPlan.preferredActivities) {
        setSelectedActivities(currentPlan.preferredActivities);
      }
      if (currentPlan.moodMeter) {
        setMoodMeter(currentPlan.moodMeter);
      }
    }
  }, [currentPlan?.id]);

  // Live exhaustion projection
  const liveDistanceKm = estimateDistanceKm(fromLocation || 'New Delhi', toLocation || 'Goa');
  const liveExhaustionProjection = calculateExhaustion(liveDistanceKm, transportMode, selectedActivities, moodMeter);

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    );
  };

  // Handler to Add a Buffer Day in Final Itinerary
  const handleAddBufferDay = () => {
    if (!currentPlan || hasBufferDayAdded) return;

    const bufferDayNumber = currentPlan.dayPlans.length + 1;
    const newDayPlans = [
      ...currentPlan.dayPlans,
      {
        dayNumber: bufferDayNumber,
        title: `DAY ${bufferDayNumber}: RESTORATIVE ACCLIMATIZATION & REJUVENATION BUFFER`,
        highlights: 'Mandatory slow-tempo recovery: sleep-in brunch, infinity pool relaxation, Ayurvedic massage & serene sunset tea',
        dayEstimatedCost: Math.round((currentPlan.budgetSplit.food * 0.2) + (currentPlan.budgetSplit.activities * 0.1)),
        schedule: [
          {
            time: '10:30 AM',
            activity: 'Late wake-up & leisurely courtyard breakfast with fresh cold-pressed juices',
            location: `${currentPlan.popularStays[0]?.name || 'Basecamp Resort'} Garden Deck`,
            cost: 350 * currentPlan.friendsCount,
            tips: 'No alarms set; allow full circadian rhythm recovery'
          },
          {
            time: '02:00 PM',
            activity: 'Herbal aromatherapy, spa session or quiet poolside reading under shaded canopy',
            location: 'Wellness Sanctuary & Heated Pool',
            cost: 800 * currentPlan.friendsCount,
            tips: 'Hydrate with tender coconut water & herbal infusions'
          },
          {
            time: '05:30 PM',
            activity: 'Gentle golden hour sunset promenade without camera rush or trekking shoes',
            location: 'Peaceful Scenic Promenade / Valley View',
            cost: 0,
            tips: 'Breathe the crisp air; zero itinerary deadlines'
          },
          {
            time: '08:00 PM',
            activity: 'Quiet candlelight dining with light, digestible regional cuisine & acoustic sitar',
            location: `${currentPlan.diningHighlights[0]?.name || 'Tranquil Courtyard Dining'}`,
            cost: 500 * currentPlan.friendsCount,
            tips: 'Turn off notification alerts for deep restorative sleep'
          }
        ],
        diningOptions: currentPlan.diningHighlights,
        shoppingRecommendations: []
      }
    ];

    const updatedExhaustion = {
      ...currentPlan.exhaustion,
      score: Math.max(18, Math.round(currentPlan.exhaustion.score * 0.62)),
      level: (Math.max(18, Math.round(currentPlan.exhaustion.score * 0.62)) > 50 ? 'ACTIVE' : 'RELAXED') as any,
      color: '#10b981',
      gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
      description: 'BUFFER DAY INTEGRATED • PHYSIOLOGICAL RESERVES FULLY RESTORED WITH PLANNED SIESTA & SPA WINDOWS',
      recoveryScore: Math.min(95, currentPlan.exhaustion.recoveryScore + 28),
      physicalStrain: Math.max(15, Math.round(currentPlan.exhaustion.physicalStrain * 0.65)),
      recoveryTips: [
        'Buffer day guarantees 9+ hours continuous restful sleep',
        'Physical strain dissipated by 35% through zero-commute rest day',
        ...currentPlan.exhaustion.recoveryTips
      ]
    };

    const updatedPlan: ItineraryPlan = {
      ...currentPlan,
      dayPlans: newDayPlans,
      exhaustion: updatedExhaustion
    };

    setHasBufferDayAdded(true);
    onPlanCreated(updatedPlan);
  };

  // Handler to Change a Specific Plan Day to a Relaxed Day
  const handleChangePlanDay = (dayNumber: number) => {
    if (!currentPlan) return;

    const newDayPlans = currentPlan.dayPlans.map((d) => {
      if (d.dayNumber === dayNumber) {
        return {
          ...d,
          title: `DAY ${dayNumber}: LEISURE & SLOW-LIVING DETOX (RECONFIGURED)`,
          highlights: 'Paced exploration replacing high-strain trekking with relaxed heritage cafes, artisan galleries & sunset tea',
          schedule: [
            {
              time: '09:30 AM',
              activity: 'Unhurried artisan bakery breakfast & organic coffee tasting',
              location: `${currentPlan.diningHighlights[1]?.name || 'Local Artisan Bakery'}`,
              cost: 300 * currentPlan.friendsCount,
              tips: 'Enjoy morning sunlight without rushing'
            },
            {
              time: '01:00 PM',
              activity: 'Shaded museum / gallery stroll or riverside cafe chilling',
              location: `${currentPlan.topSights[0]?.name || 'Art & Heritage Gallery'}`,
              cost: 150 * currentPlan.friendsCount,
              tips: 'Indoor air-conditioned environment to avoid heat fatigue'
            },
            {
              time: '04:30 PM',
              activity: 'Scenic sunset boat cruise or rooftop tea tasting',
              location: 'Sunset Viewpoint Terrace',
              cost: 250 * currentPlan.friendsCount,
              tips: 'Sit back and enjoy the panoramic vistas'
            },
            {
              time: '07:30 PM',
              activity: 'Early dinner featuring light coastal / comfort foods and restful evening sleep',
              location: `${currentPlan.diningHighlights[0]?.name || 'Comfort Food Bistro'}`,
              cost: 450 * currentPlan.friendsCount,
              tips: 'Sleep early to recharge for tomorrow'
            }
          ]
        };
      }
      return d;
    });

    const updatedExhaustion = {
      ...currentPlan.exhaustion,
      score: Math.max(22, Math.round(currentPlan.exhaustion.score * 0.75)),
      description: `DAY ${dayNumber} CONVERTED TO SLOW LEISURE • INTENSE TREKS REMOVED IN FAVOR OF CAFE RELAXATION`,
      physicalStrain: Math.max(20, Math.round(currentPlan.exhaustion.physicalStrain * 0.72)),
      recoveryScore: Math.min(90, currentPlan.exhaustion.recoveryScore + 18)
    };

    onPlanCreated({
      ...currentPlan,
      dayPlans: newDayPlans,
      exhaustion: updatedExhaustion
    });
  };

  // Handler to Optimize Mood Meter for Maximum Relaxation
  const handleOptimizeForRelaxation = () => {
    const zenMood: MoodMeterConfig = {
      adventure: 25,
      nature: 80,
      food: 70,
      photography: 65,
      nightlife: 25,
      relaxation: 95,
      budgetSensitivity: moodMeter.budgetSensitivity,
      walkingTolerance: 30,
      crowdTolerance: 25
    };
    setMoodMeter(zenMood);

    if (currentPlan) {
      const distanceKm = estimateDistanceKm(currentPlan.fromLocation, currentPlan.toLocation);
      const newExhaustion = calculateExhaustion(distanceKm, currentPlan.transportMode, currentPlan.preferredActivities, zenMood);
      onPlanCreated({
        ...currentPlan,
        moodMeter: zenMood,
        exhaustion: newExhaustion
      });
    }
  };

  // Execute Itinerary Generation
  const handleGeneratePlan = async () => {
    setIsGenerating(true);

    const safeFrom = fromLocation.trim() || 'New Delhi';
    const safeTo = toLocation.trim() || 'Goa';
    const safeFriends = Math.max(1, friendsCount);
    const safeBudget = Math.max(5000, budget);

    setHasBufferDayAdded(false);

    // Save trip record to TRIP//OS backend & Supabase PostgreSQL
    let backendTripId: string | number = `plan-${Date.now()}`;
    try {
      const endD = new Date(selectedDate + 'T00:00:00');
      endD.setDate(endD.getDate() + Math.max(1, durationDays - 1));
      const endDateStr = isNaN(endD.getTime()) ? selectedDate : endD.toISOString().split('T')[0];

      const backendTrip = await createTripApi({
        name: `${safeTo.toUpperCase()} EXPEDITION`,
        startDate: selectedDate,
        startLocation: safeFrom,
        endDate: endDateStr,
        endLocation: safeTo,
        budget: safeBudget,
        transportMode: transportMode.toUpperCase()
      });
      if (backendTrip && backendTrip.trip) {
        backendTripId = backendTrip.trip.id;
      }
    } catch (err) {
      console.warn('Backend trip creation notice:', err);
    }

    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLocation: safeFrom,
          toLocation: safeTo,
          friendsCount: safeFriends,
          budget: safeBudget,
          transportMode,
          preferredActivities: selectedActivities,
          moodMeter,
          startDate: selectedDate,
          durationDays: durationDays
        })
      });

      const data = await res.json();
      if (data && data.success && data.plan) {
        const fallbackPlan = generateCustomItinerary({
          fromLocation: safeFrom,
          toLocation: safeTo,
          friendsCount: safeFriends,
          budget: safeBudget,
          transportMode,
          preferredActivities: selectedActivities,
          weatherType,
          moodMeter,
          startDate: selectedDate,
          durationDays: durationDays
        });

        const mergedPlan: ItineraryPlan = {
          ...fallbackPlan,
          id: String(backendTripId),
          moodMeter,
          startDate: selectedDate,
          durationDays: durationDays,
          title: data.plan.title || fallbackPlan.title,
          topSights: data.plan.topSights && data.plan.topSights.length > 0 ? data.plan.topSights.map((s: any, idx: number) => ({
            ...s,
            id: `sight-ai-${idx}`,
            lat: fallbackPlan.destinationCoords.lat + (idx * 0.015 - 0.02),
            lng: fallbackPlan.destinationCoords.lng + (idx * 0.018 - 0.015),
            googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(s.name + ' ' + safeTo)}`
          })) : fallbackPlan.topSights,
          diningHighlights: data.plan.diningHighlights && data.plan.diningHighlights.length > 0 ? data.plan.diningHighlights.map((d: any, idx: number) => ({
            ...d,
            id: `dine-ai-${idx}`,
            googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(d.name + ' ' + safeTo)}`
          })) : fallbackPlan.diningHighlights,
          popularStays: data.plan.popularStays && data.plan.popularStays.length > 0 ? data.plan.popularStays.map((h: any, idx: number) => ({
            ...h,
            id: `stay-ai-${idx}`,
            lat: fallbackPlan.destinationCoords.lat + (idx * -0.012 + 0.01),
            lng: fallbackPlan.destinationCoords.lng + (idx * 0.014 - 0.01),
            bookingLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name || safeTo)}`,
            googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(h.name + ' ' + safeTo)}`
          })) : fallbackPlan.popularStays,
          dayPlans: data.plan.dayPlans && data.plan.dayPlans.length > 0 ? data.plan.dayPlans.map((d: any, dIdx: number) => ({
            ...d,
            dayEstimatedCost: d.dayEstimatedCost || Math.round(safeBudget / 3),
            diningOptions: fallbackPlan.dayPlans[dIdx]?.diningOptions || fallbackPlan.diningHighlights,
            shoppingRecommendations: d.shoppingRecommendations || fallbackPlan.dayPlans[dIdx]?.shoppingRecommendations || []
          })) : fallbackPlan.dayPlans
        };

        onPlanCreated(mergedPlan);
        setIsGenerating(false);
        setCurrentStep(6);
        return;
      }
    } catch {
      // Graceful fallback to deterministic local engine
    }

    // Direct local generator fallback
    setTimeout(() => {
      const newPlan = {
        ...generateCustomItinerary({
          fromLocation: safeFrom,
          toLocation: safeTo,
          friendsCount: safeFriends,
          budget: safeBudget,
          transportMode,
          preferredActivities: selectedActivities,
          weatherType,
          moodMeter,
          startDate: selectedDate,
          durationDays: durationDays
        }),
        id: String(backendTripId)
      };

      onPlanCreated(newPlan);
      setIsGenerating(false);
      setCurrentStep(6);
    }, 350);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      {/* 1. Multi-Step Page Stepper Header with optional quick date dropbox */}
      <PlanStepperHeader
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
        hasItinerary={!!currentPlan}
        selectedDate={selectedDate}
        durationDays={durationDays}
        onChangeDate={setSelectedDate}
        onChangeDuration={setDurationDays}
      />

      {/* 2. Step-by-Step Pages Animation Container */}
      <AnimatePresence mode="wait">
        {/* PAGE 1: ROUTE & DESTINATION & DROPBOX CALENDAR */}
        {currentStep === 1 && (
          <StepRoute
            key="step-route"
            fromLocation={fromLocation}
            toLocation={toLocation}
            selectedDate={selectedDate}
            durationDays={durationDays}
            onChangeFrom={setFromLocation}
            onChangeTo={setToLocation}
            onChangeDate={setSelectedDate}
            onChangeDuration={setDurationDays}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* PAGE 2: PARTY & TRANSIT */}
        {currentStep === 2 && (
          <StepTravelersTransport
            key="step-travelers"
            friendsCount={friendsCount}
            transportMode={transportMode}
            onChangeFriendsCount={setFriendsCount}
            onChangeTransportMode={setTransportMode}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* PAGE 3: BUDGET & VIBE */}
        {currentStep === 3 && (
          <StepBudgetVibe
            key="step-budget"
            budget={budget}
            friendsCount={friendsCount}
            moodMeter={moodMeter}
            onChangeBudget={setBudget}
            onChangeMoodMeter={setMoodMeter}
            projectedExhaustion={liveExhaustionProjection}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* PAGE 4: HIGHLIGHT INTERESTS */}
        {currentStep === 4 && (
          <StepActivities
            key="step-activities"
            selectedActivities={selectedActivities}
            onToggleActivity={toggleActivity}
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* PAGE 5: REVIEW TRIP BRIEF */}
        {currentStep === 5 && (
          <StepReview
            key="step-review"
            fromLocation={fromLocation}
            toLocation={toLocation}
            friendsCount={friendsCount}
            budget={budget}
            transportMode={transportMode}
            selectedActivities={selectedActivities}
            moodMeter={moodMeter}
            isGenerating={isGenerating}
            selectedDate={selectedDate}
            durationDays={durationDays}
            onGenerate={handleGeneratePlan}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {/* PAGE 6: FINAL ITINERARY */}
        {currentStep === 6 && currentPlan && (
          <FinalItineraryView
            key="final-itinerary"
            plan={currentPlan}
            onSavePlan={onSavePlan}
            onModifySteps={() => setCurrentStep(1)}
            onNewPlan={() => {
              setFromLocation('New Delhi');
              setToLocation('Goa Coastline');
              setFriendsCount(3);
              setBudget(45000);
              setCurrentStep(1);
            }}
            onAddBufferDay={handleAddBufferDay}
            onChangePlanDay={handleChangePlanDay}
            onOptimizeForRelaxation={handleOptimizeForRelaxation}
            hasBufferDayAdded={hasBufferDayAdded}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
