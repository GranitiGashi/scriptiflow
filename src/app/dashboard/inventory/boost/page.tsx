'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import authManager from '@/lib/auth';

type Car = {
  id: string;
  url: string;
  make: string;
  model: string;
  modelDescription: string;
  price: string;
  currency: string;
  image: string | null;
  mileage: string;
  firstRegistration: string;
  fuel: string;
  power: string;
  gearbox: string;
  dealerLat?: number;
  dealerLon?: number;
};

type AdAccount = { id: string; name: string; currency?: string; account_status?: number };

export default function BoostPage() {
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const [car, setCar] = useState<Car | null>(null);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [adAccountsError, setAdAccountsError] = useState<string>('');
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [plan, setPlan] = useState<any>(null);
  const [creative, setCreative] = useState<any>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [adBudget, setAdBudget] = useState<number>(0);
  const [campaignDuration, setCampaignDuration] = useState<number>(0);
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [socialAccounts, setSocialAccounts] = useState<any>(null);
  const [reachEstimate, setReachEstimate] = useState<any>(null);
  const [loadingReach, setLoadingReach] = useState<boolean>(false);
  const [showReach, setShowReach] = useState<boolean>(false);
  
  // Multiple image selection (like social media post page)
  const [allImages, setAllImages] = useState<string[]>([]);
  const [selectedImageIdxs, setSelectedImageIdxs] = useState<Set<number>>(new Set());
  const [loadingImages, setLoadingImages] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  const countryOptions = [
    { code: 'DE', name: 'Germany' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'DK', name: 'Denmark' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
  ];

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('selected_car_for_boost') : null;
    if (!raw) {
      router.push('/dashboard/inventory');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Car;
      setCar(parsed);
      // Load images from mobile.de API
      loadCarImages(parsed);
    } catch (_) {
      router.push('/dashboard/inventory');
    }
  }, [router]);

  // Load images from mobile.de API (similar to social media post page)
  async function loadCarImages(carData: Car) {
    setLoadingImages(true);
    try {
      const detailsRes = await authManager.authenticatedFetch(
        `${baseDomain}/api/mobilede/ad-details?mobile_ad_id=${encodeURIComponent(carData.id)}`,
        { headers: { Accept: 'application/json' } }
      );
      
      let images: string[] = [];
      if (detailsRes.ok) {
        const d = await detailsRes.json();
        images = Array.isArray(d?.images) ? d.images : [];
      }
      
      // Fallback to car image if no images from API
      if (!images.length && carData.image) {
        images = [carData.image];
      }
      
      setAllImages(images);
      
      // Auto-select first 10 images (like social media post page)
      const initialSelection = new Set<number>();
      for (let i = 0; i < Math.min(10, images.length); i++) {
        initialSelection.add(i);
      }
      setSelectedImageIdxs(initialSelection);
    } catch (e) {
      console.error('Failed to load images:', e);
      // Fallback to car image
      if (carData.image) {
        setAllImages([carData.image]);
        setSelectedImageIdxs(new Set([0]));
      }
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    if (car && !plan && !loadingAI) {
      fetchRecommendation();
    }
  }, [car]);

  useEffect(() => {
    async function loadAdAccounts() {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/ads/ad-accounts`, {
          headers: { Accept: 'application/json' }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const message = (errData as any).error || 'Failed to load ad accounts';
          setAdAccountsError(message);
          return;
        }

        const data = await res.json();
        const list: AdAccount[] = data?.data || data || [];
        setAdAccounts(list);
        if (list.length > 0) setSelectedAdAccount(list[0].id);
      } catch (e: any) {
        console.error('Error loading ad accounts:', e);
        setAdAccountsError(e.message || 'Failed to load ad accounts');
      }
    }

    async function loadSocialAccounts() {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/social-accounts`, {
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setSocialAccounts(data);
          if (data?.facebook_id && !creative.page_id) {
            setCreative((c: any) => ({ ...(c || {}), page_id: data.facebook_id }));
          }
        }
      } catch (e: any) {
        console.error('Failed to load social accounts:', e);
      }
    }

    loadAdAccounts();
    loadSocialAccounts();
  }, [baseDomain]);

  const mainData = useMemo(() => {
    if (!car) return null;
    return {
      title: `${car.make} ${car.model}`.trim(),
      price_eur: car.price ? Number(car.price) : undefined,
      url: car.url,
      image_url: car.image || undefined,
      description: car.modelDescription || undefined,
      attributes: {
        mileage_km: car.mileage || undefined,
        first_registration: car.firstRegistration || undefined,
        fuel: car.fuel || undefined,
        power: car.power || undefined,
        gearbox: car.gearbox || undefined,
      },
    };
  }, [car]);

  async function fetchReachEstimate() {
    if (!selectedAdAccount || !plan) return;
    setLoadingReach(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${baseDomain}/api/ads/reach-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'x-refresh-token': refreshToken || ''
        },
        body: JSON.stringify({
          ad_account_id: selectedAdAccount,
          targeting: plan.targeting,
          daily_budget_cents: Math.round((adBudget * 100) / campaignDuration),
          campaign_duration_days: campaignDuration
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReachEstimate(data);
      }
    } catch (e: any) {
      console.error('Failed to get reach estimate:', e);
    } finally {
      setLoadingReach(false);
    }
  }

  async function fetchRecommendation() {
    if (!mainData) {
      setAiError('No car data available');
      return;
    }
    
    setLoadingAI(true);
    setAiError('');
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!token) throw new Error('Not authenticated');
      
      console.log('🚀 Starting Smart AI recommendation generation...');
      
      // Advanced AI request with comprehensive context for precise recommendations
      const price = mainData.price_eur || 0;
      const mileageStr = car?.mileage || '';
      const mileageNum = parseInt(mileageStr.replace(/\D/g, '')) || 0;
      
      // Better date parsing
      let year = new Date().getFullYear();
      if (car?.firstRegistration) {
        const dateStr = car.firstRegistration;
        if (dateStr.includes('-')) {
          year = parseInt(dateStr.split('-')[0]) || year;
        } else if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          year = parseInt(parts[2] || parts[0]) || year;
        } else {
          year = parseInt(dateStr) || year;
        }
      }
      const carAge = new Date().getFullYear() - year;
      
      // Intelligent market segmentation
      let marketSegment = 'budget';
      let targetAudience = 'value-seekers';
      if (price > 50000) {
        marketSegment = 'luxury';
        targetAudience = 'high-income-professionals';
      } else if (price > 30000) {
        marketSegment = 'premium';
        targetAudience = 'mid-to-high-income';
      } else if (price > 15000) {
        marketSegment = 'mid-range';
        targetAudience = 'middle-class-families';
      }
      
      // Vehicle condition analysis
      let condition = 'excellent';
      if (mileageNum > 150000 || carAge > 10) condition = 'used-high-mileage';
      else if (mileageNum > 80000 || carAge > 5) condition = 'used-moderate';
      else if (mileageNum < 20000 && carAge <= 2) condition = 'near-new';
      
      // Fuel type targeting hints
      const isElectric = (car?.fuel || '').toLowerCase().includes('elektro') || (car?.fuel || '').toLowerCase().includes('electric');
      const isHybrid = (car?.fuel || '').toLowerCase().includes('hybrid');
      const isDiesel = (car?.fuel || '').toLowerCase().includes('diesel');
      
      // Brand perception
      const premiumBrands = ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Tesla', 'Lexus', 'Jaguar', 'Land Rover'];
      const isPremiumBrand = premiumBrands.some(b => (car?.make || '').toLowerCase().includes(b.toLowerCase()));
      
      const enhancedCarData = {
        // Basic Info
        ...mainData,
        make: car?.make,
        model: car?.model,
        full_name: `${car?.make} ${car?.model}`.trim(),
        
        // Visual Assets
        images: {
          total_count: allImages.length,
          selected_count: selectedImageIdxs.size,
          has_multiple: allImages.length > 1,
          ad_format: selectedImageIdxs.size > 1 ? 'carousel' : 'single_image'
        },
        
        // Vehicle Details
        specifications: {
          year: year,
          age_years: carAge,
          mileage_km: mileageNum,
          fuel_type: car?.fuel,
          power: car?.power,
          transmission: car?.gearbox,
          is_electric: isElectric,
          is_hybrid: isHybrid,
          is_diesel: isDiesel
        },
        
        // Market Analysis
        market: {
          price_eur: price,
          segment: marketSegment,
          condition: condition,
          is_premium_brand: isPremiumBrand,
          value_proposition: price < 10000 ? 'affordable' : price < 25000 ? 'value-for-money' : price < 40000 ? 'quality' : 'premium-luxury'
        },
        
        // Geographic Targeting
        location: {
          has_coordinates: !!(car?.dealerLat && car?.dealerLon),
          coordinates: car?.dealerLat && car?.dealerLon ? {
            lat: car.dealerLat,
            lon: car.dealerLon
          } : null,
          radius_km: radiusKm,
          targeting_type: car?.dealerLat && car?.dealerLon ? 'radius' : 'country'
        },
        
        // Audience Insights
        audience: {
          primary_target: targetAudience,
          age_range: isPremiumBrand || price > 35000 ? '35-55' : price > 15000 ? '28-50' : '25-45',
          income_level: price > 40000 ? 'high' : price > 20000 ? 'medium-high' : 'medium',
          interests: [
            isElectric ? 'sustainable_living' : '',
            isPremiumBrand ? 'luxury_lifestyle' : '',
            carAge <= 3 ? 'new_technology' : '',
            price < 15000 ? 'budget_conscious' : ''
          ].filter(Boolean)
        }
      };
      
      // Campaign Context
      const campaignContext = {
        // Ad Configuration
        ad_type: selectedImageIdxs.size > 3 ? 'multi_carousel' : selectedImageIdxs.size > 1 ? 'carousel' : 'single_image',
        creative_assets: selectedImageIdxs.size,
        
        // Budget Strategy
        budget: {
          total: adBudget,
          daily: Math.round(adBudget / campaignDuration * 100) / 100,
          range: adBudget > 300 ? 'aggressive' : adBudget > 150 ? 'moderate' : adBudget > 75 ? 'conservative' : 'minimal',
          duration_days: campaignDuration
        },
        
        // Platform Strategy
        platforms: ['facebook', 'instagram'],
        placements: selectedImageIdxs.size > 1 ? ['feed', 'stories', 'reels'] : ['feed', 'stories'],
        
        // Optimization Goals
        objectives: {
          primary: 'conversions',
          secondary: isElectric || isPremiumBrand ? 'brand_awareness' : 'traffic',
          kpi: 'cost_per_lead'
        },
        
        // Competitive Intelligence
        competitive: {
          market_density: radiusKm < 20 ? 'high' : radiusKm < 50 ? 'medium' : 'low',
          differentiation: [
            isElectric ? 'eco_friendly' : '',
            carAge <= 2 ? 'latest_model' : '',
            mileageNum < 30000 ? 'low_mileage' : '',
            isPremiumBrand ? 'premium_brand' : ''
          ].filter(Boolean)
        },
        
        // Timing Intelligence
        timing: {
          season: new Date().getMonth() >= 2 && new Date().getMonth() <= 4 ? 'spring_buying_season' : 
                  new Date().getMonth() >= 8 && new Date().getMonth() <= 10 ? 'fall_buying_season' : 'regular',
          day_of_week: new Date().getDay(),
          optimal_posting: 'weekday_morning'
        }
      };
      
      console.log('📤 Sending smart AI request with:', {
        vehicle: enhancedCarData.full_name,
        market_segment: enhancedCarData.market.segment,
        ad_format: campaignContext.ad_type,
        budget: campaignContext.budget.total,
        selected_images: selectedImageIdxs.size
      });

      const res = await fetch(`${baseDomain}/api/ads/recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'x-refresh-token': refreshToken || ''
        },
        body: JSON.stringify({ 
          car: enhancedCarData,
          context: campaignContext,
          objective: 'smart_auto', // Signal to use advanced AI
          country: plan?.country || 'DE',
          language: 'de',
          request_details: {
            include_ab_test_suggestions: true,
            optimize_for: 'conversions',
            creative_style: isPremiumBrand ? 'elegant' : price < 15000 ? 'friendly' : 'professional',
            urgency_level: carAge > 8 ? 'high' : 'medium'
          }
        })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('❌ AI API Error:', err);
        throw new Error((err as any).error || `Failed to get recommendation (${res.status})`);
      }
      
      const data = await res.json();
      if (!data || (!data.proposal && !data.objective)) {
        throw new Error('Invalid response from AI - no proposal data received');
      }
      
      const proposal = data?.proposal || data;

      // Log the AI response for debugging
      console.log('✅ AI Recommendation received:', {
        objective: proposal.objective,
        targeting_strategy: proposal.targeting_strategy,
        expected_performance: proposal.expected_performance,
        optimization_tips: proposal.optimization_tips,
        creative_headline: proposal.creative?.headline
      });

      const mapObjective = (obj?: string) => {
        const key = (obj || '').toLowerCase();
        if (key.includes('lead')) return 'LEAD_GENERATION';
        if (key.includes('message')) return 'MESSAGES';
        if (key.includes('traffic') || key.includes('click')) return 'LINK_CLICKS';
        if (key.includes('sales') || key.includes('conversion')) return 'CONVERSIONS';
        return 'LINK_CLICKS';
      };

      const durationDays = proposal.duration_days || proposal.recommended_duration || 7;
      const dailyBudgetEur = proposal.daily_budget_eur ?? proposal.daily_budget ?? (proposal.daily_budget_cents ? (Number(proposal.daily_budget_cents) / 100) : 10);

      const ta = proposal.targeting || proposal.target_audience;
      let targeting: any = undefined;
      if (ta) {
        if (car?.dealerLat && car?.dealerLon) {
          targeting = {
            geo_locations: {
              custom_locations: [{
                latitude: car.dealerLat,
                longitude: car.dealerLon,
                radius: radiusKm || 25,
                distance_unit: 'kilometer',
              }],
            },
          };
        } else {
          targeting = { geo_locations: { countries: [proposal.country || 'DE'] } };
        }
        
        // Enhanced age targeting
        const age = typeof ta.age === 'string' ? ta.age : undefined;
        if (age && age.includes('-')) {
          const [min, max] = age.split('-').map((n: string) => Number(n.trim()));
          if (!Number.isNaN(min)) targeting.age_min = Math.max(18, min); // Facebook minimum
          if (!Number.isNaN(max)) targeting.age_max = Math.min(65, max); // Reasonable maximum
        }
        
        // Gender targeting
        const gender = (ta.gender || '').toLowerCase();
        if (gender === 'male') targeting.genders = [1];
        else if (gender === 'female') targeting.genders = [2];
        // 'all' or undefined means target all genders (no genders field)
        
        // Enhanced interest targeting (new from smart AI)
        if (ta.interests && Array.isArray(ta.interests) && ta.interests.length > 0) {
          // Store for display - actual interest IDs would be mapped server-side
          targeting.flexible_spec = [{
            interests: ta.interests.map((interest: string) => ({
              name: interest
            }))
          }];
        }
        
        // Behavior targeting (new from smart AI)
        if (ta.behaviors && Array.isArray(ta.behaviors) && ta.behaviors.length > 0) {
          if (!targeting.flexible_spec) targeting.flexible_spec = [{}];
          targeting.flexible_spec[0].behaviors = ta.behaviors.map((behavior: string) => ({
            name: behavior
          }));
        }
      }

      // Enhanced placements handling
      let placements = proposal.placements || ['facebook_feeds', 'instagram_feeds'];
      if (Array.isArray(placements)) {
        // Ensure we have optimal placements based on image count
        if (selectedImageIdxs.size > 1) {
          // For carousel ads, add stories and reels
          if (!placements.includes('instagram_stories')) placements.push('instagram_stories');
          if (!placements.includes('facebook_stories')) placements.push('facebook_stories');
          if (!placements.includes('facebook_reels')) placements.push('facebook_reels');
        }
      }

      setPlan({
        objective: mapObjective(proposal.objective),
        duration_days: Number(durationDays) || 7,
        daily_budget_cents: Math.round(Number(dailyBudgetEur || 10) * 100),
        targeting,
        country: proposal.country || 'DE',
        bid_strategy: "LOWEST_COST",
        bid_amount: 200,
        placements,
        // Store AI insights for display
        ai_insights: {
          targeting_strategy: proposal.targeting_strategy,
          expected_performance: proposal.expected_performance,
          optimization_tips: proposal.optimization_tips
        }
      });

      const creativeSrc = proposal.creative || proposal.ad_creative || {};
      const cta = creativeSrc.CTA || creativeSrc.cta || 'LEARN_MORE';
      
      setCreative({
        campaign_name: proposal.campaign_name || `${mainData.title} Campaign`,
        adset_name: proposal.adset_name || `${mainData.title} Ad Set`,
        ad_name: proposal.ad_name || `${mainData.title} Ad`,
        primary_text: creativeSrc.primary_text || `Check out this ${mainData.title}!`,
        headline: creativeSrc.headline || mainData.title,
        description: creativeSrc.description || mainData.description || '',
        cta,
        image_url: mainData.image_url,
        url: mainData.url,
        page_id: proposal.page_id || ''
      });
      
      // Show success message with performance estimates
      if (proposal.expected_performance) {
        console.log('📊 Expected Performance:', proposal.expected_performance);
      }
      if (proposal.optimization_tips && proposal.optimization_tips.length > 0) {
        console.log('💡 Optimization Tips:', proposal.optimization_tips);
      }
    } catch (e: any) {
      setAiError(e.message || 'Failed to get recommendation');
    } finally {
      setLoadingAI(false);
    }
  }

  useEffect(() => {
    if (!plan) return;
    if (car?.dealerLat && car?.dealerLon) {
      setPlan((p: any) => ({
        ...(p || {}),
        targeting: {
          geo_locations: {
            custom_locations: [{
              latitude: car.dealerLat,
              longitude: car.dealerLon,
              radius: radiusKm || 25,
              distance_unit: 'kilometer',
            }]
          }
        }
      }));
    }
  }, [radiusKm, car?.dealerLat, car?.dealerLon]);

  useEffect(() => {
    if (plan?.daily_budget_cents && plan?.duration_days) {
      const total = Math.max(0, Math.round((plan.daily_budget_cents / 100) * plan.duration_days));
      if (Number.isFinite(total) && total !== adBudget) {
        setAdBudget(total);
      }
      if (plan.duration_days !== campaignDuration) {
        setCampaignDuration(plan.duration_days);
      }
    }
  }, [plan?.daily_budget_cents, plan?.duration_days]);

  useEffect(() => {
    if (plan && selectedAdAccount && adBudget > 0) {
      fetchReachEstimate();
    }
  }, [plan, selectedAdAccount, adBudget, campaignDuration]);

  async function handleLaunch() {
    if (!selectedAdAccount) {
      setSubmitError('Please select an ad account');
      return;
    }
    if (!plan || !creative) {
      setSubmitError('Missing plan or creative');
      return;
    }
    if (selectedImageIdxs.size === 0) {
      setSubmitError('Please select at least one image');
      return;
    }
    
    setSubmitting(true);
    setSubmitError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!token) throw new Error('Not authenticated');
      
      // Get selected images
      const selectedImages = Array.from(selectedImageIdxs).map(idx => allImages[idx]);
      
      const res = await fetch(`${baseDomain}/api/ads/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'x-refresh-token': refreshToken || ''
        },
        body: JSON.stringify({
          ad_account_id: selectedAdAccount,
          plan: {
            ...plan,
            daily_budget_cents: Math.round((adBudget * 100) / campaignDuration),
            special_ad_categories: plan?.special_ad_categories || []
          },
          creative: {
            ...creative,
            image_url: selectedImages[0], // Primary image
            image_urls: selectedImages // All selected images
          },
          total_budget_cents: Math.round(adBudget * 100),
          campaign_duration_days: campaignDuration
        })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || 'Failed to create campaign');
      }
      
      sessionStorage.removeItem('selected_car_for_boost');
      router.push(`/dashboard/social-media`);
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to launch campaign');
    } finally {
      setSubmitting(false);
    }
  }

  const toggleImageSelection = (idx: number) => {
    const newSet = new Set(selectedImageIdxs);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedImageIdxs(newSet);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boost Car Ad</h1>
            <p className="text-sm text-gray-600 mt-1">Create a Facebook & Instagram ad campaign</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/inventory')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        {/* Car Info */}
        {car && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden">
                {car.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{car.make} {car.model}</h2>
                <p className="text-gray-600 text-sm mt-1">{car.modelDescription}</p>
                <div className="mt-3 text-2xl font-bold text-gray-900">{car.price} {car.currency}</div>
              </div>
            </div>
          </div>
        )}

        {/* Image Selection Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ad Images</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedImageIdxs.size} image{selectedImageIdxs.size !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={() => setShowImageModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Select Images
            </button>
          </div>

          {/* Selected Images Preview */}
          {selectedImageIdxs.size > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from(selectedImageIdxs).slice(0, 10).map((idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={allImages[idx]} alt={`Selected ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === Array.from(selectedImageIdxs)[0] && (
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              {selectedImageIdxs.size > 10 && (
                <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                  +{selectedImageIdxs.size - 10}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Click "Select Images" to choose photos for your ad
            </div>
          )}
        </div>

        {/* Image Selection Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Select Images for Your Ad</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedImageIdxs.size} of {allImages.length} selected
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {allImages.length > 0 && (
                    <button
                      onClick={() => {
                        const allIdxs = new Set(Array.from({ length: allImages.length }, (_, i) => i));
                        setSelectedImageIdxs(selectedImageIdxs.size === allImages.length ? new Set() : allIdxs);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedImageIdxs.size === allImages.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingImages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : allImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleImageSelection(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedImageIdxs.has(idx)
                            ? 'ring-4 ring-blue-500 ring-offset-2 scale-95'
                            : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-105'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Car ${idx + 1}`} className="w-full h-full object-cover" />
                        {selectedImageIdxs.has(idx) && (
                          <>
                            <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                              ✓
                            </div>
                          </>
                        )}
                        {Array.from(selectedImageIdxs)[0] === idx && selectedImageIdxs.has(idx) && (
                          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
                            Primary Image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No images available
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  💡 Tip: Select multiple images to create carousel ads that perform better
                </p>
                <button
                  onClick={() => setShowImageModal(false)}
                  disabled={selectedImageIdxs.size === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Done ({selectedImageIdxs.size} selected)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Settings</h3>
            <button
              onClick={fetchRecommendation}
              disabled={loadingAI || !car}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loadingAI ? 'Generating...' : '✨ AI Optimize'}
            </button>
          </div>

          {aiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {aiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
              <select
                value={plan?.objective || ''}
                onChange={(e) => setPlan((p: any) => ({ ...(p || {}), objective: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LINK_CLICKS">Link Clicks</option>
                <option value="LEAD_GENERATION">Lead Generation</option>
                <option value="MESSAGES">Messages</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
              <input
                type="number"
                value={plan?.duration_days || ''}
                onChange={(e) => setPlan((p: any) => ({ ...(p || {}), duration_days: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Click 'AI Optimize' or enter manually"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={plan?.country || ''}
                onChange={(e) => {
                  const code = e.target.value;
                  setPlan((p: any) => {
                    const next = { ...(p || {}), country: code };
                    const hasRadius = !!p?.targeting?.geo_locations?.custom_locations?.length;
                    if (!hasRadius) {
                      next.targeting = { geo_locations: { countries: [code] } };
                    }
                    return next;
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Radius (km)</label>
              <input
                type="number"
                value={radiusKm || ''}
                onChange={(e) => setRadiusKm(Math.max(0, Number(e.target.value || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Click 'AI Optimize' or enter manually"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Budget (€)</label>
              <input
                type="number"
                value={adBudget || ''}
                onChange={(e) => setAdBudget(Math.max(0, Number(e.target.value || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Click 'AI Optimize' or enter manually"
              />
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {plan?.ai_insights && (plan.ai_insights.targeting_strategy || plan.ai_insights.expected_performance || plan.ai_insights.optimization_tips) && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">AI Campaign Intelligence</h3>
              <div className="ml-auto px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                SMART MODE
              </div>
            </div>

            {/* Targeting Strategy */}
            {plan.ai_insights.targeting_strategy && (
              <div className="mb-4 bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Targeting Strategy</h4>
                    <p className="text-sm text-gray-700">{plan.ai_insights.targeting_strategy}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Expected Performance */}
            {plan.ai_insights.expected_performance && (
              <div className="mb-4 bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Expected Performance</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {plan.ai_insights.expected_performance.estimated_reach && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {plan.ai_insights.expected_performance.estimated_reach.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Est. Reach</div>
                        </div>
                      )}
                      {plan.ai_insights.expected_performance.estimated_ctr && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {plan.ai_insights.expected_performance.estimated_ctr}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Est. CTR</div>
                        </div>
                      )}
                      {plan.ai_insights.expected_performance.estimated_conversions && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {plan.ai_insights.expected_performance.estimated_conversions}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Est. Conversions</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Optimization Tips */}
            {plan.ai_insights.optimization_tips && plan.ai_insights.optimization_tips.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Optimization Tips</h4>
                    <ul className="space-y-2">
                      {plan.ai_insights.optimization_tips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-yellow-600 font-bold mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Creative */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ad Creative</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Text</label>
              <textarea
                value={creative?.primary_text || ''}
                onChange={(e) => setCreative((c: any) => ({ ...(c || {}), primary_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Your ad text..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                <input
                  value={creative?.headline || ''}
                  onChange={(e) => setCreative((c: any) => ({ ...(c || {}), headline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catchy headline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landing URL</label>
                <input
                  value={creative?.url || ''}
                  onChange={(e) => setCreative((c: any) => ({ ...(c || {}), url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Page ID</label>
              <input
                value={creative?.page_id || ''}
                onChange={(e) => setCreative((c: any) => ({ ...(c || {}), page_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
              />
              {socialAccounts?.facebook_id && (
                <p className="text-sm text-green-600 mt-1">✓ Connected to Facebook</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            {adBudget > 0 && campaignDuration > 0 ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Campaign Budget:</span>
                  <span className="font-semibold">€{adBudget}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">{campaignDuration} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Budget:</span>
                  <span className="font-semibold">€{(adBudget / campaignDuration).toFixed(2)}/day</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-lg">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-bold text-blue-600">€{adBudget}</span>
                </div>
                <p className="text-xs text-gray-600 pt-2">✨ No service fees • Pay only for ad spend</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-2">📊 Campaign summary will appear here</p>
                <p className="text-sm text-gray-500">Click "✨ AI Optimize" or enter values manually</p>
              </div>
            )}
          </div>

          {reachEstimate && (
            <div className="mb-4">
              <button
                onClick={() => setShowReach(!showReach)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showReach ? '▼' : '▶'} Performance Estimates
              </button>
              
              {showReach && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xs text-gray-600">Daily Reach</div>
                    <div className="text-xl font-bold text-gray-900">
                      {reachEstimate?.reach_estimate?.daily_reach?.toLocaleString?.() ?? 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xs text-gray-600">Impressions</div>
                    <div className="text-xl font-bold text-gray-900">
                      {reachEstimate?.performance_estimates?.estimated_impressions?.toLocaleString?.() ?? 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-xs text-gray-600">Clicks</div>
                    <div className="text-xl font-bold text-gray-900">
                      {reachEstimate?.performance_estimates?.estimated_clicks?.toLocaleString?.() ?? 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleLaunch}
              disabled={submitting || selectedImageIdxs.size === 0}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Launching...' : '🚀 Launch Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
