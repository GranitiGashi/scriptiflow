'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  OpenInNew as ExternalLinkIcon
} from '@mui/icons-material';

interface CarData {
  id?: string;
  title: string;
  image?: string;
  url?: string;
}

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    location?: string;
    car_mobile_de_id?: string;
    car?: CarData;
  };
  cars?: CarData[];
  variant?: 'default' | 'compact' | 'detailed';
  showCarInfo?: boolean;
  className?: string;
}

export default function EventCard({ 
  event, 
  cars = [], 
  variant = 'default',
  showCarInfo = true,
  className = ''
}: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  // Try to get car data from backend first, then fallback to frontend cars
  const backendCar = event.car;
  const frontendCar = event.car_mobile_de_id ? cars.find(car => car.id === event.car_mobile_de_id) : null;
  const carData = backendCar || frontendCar;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return formatTime(dateString);
    } else {
      return `${formatDate(dateString)} ${formatTime(dateString)}`;
    }
  };

  const getCarUrl = () => {
    if (carData?.url) return carData.url;
    if (event.car_mobile_de_id) {
      return `https://suchen.mobile.de/fahrzeuge/details.html?id=${event.car_mobile_de_id}`;
    }
    return null;
  };

  const handleCarClick = () => {
    const url = getCarUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'compact') {
    return (
      <Box 
        className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          p: 1.5, 
          bgcolor: 'grey.50', 
          borderRadius: 2,
          '&:hover': { bgcolor: 'grey.100' },
          transition: 'background-color 0.2s'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
            {event.title}
          </Typography>
          {event.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {event.description}
            </Typography>
          )}
          
          {showCarInfo && carData && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
              <Box 
                onClick={handleCarClick}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.50' },
                  p: 0.5,
                  borderRadius: 1,
                  transition: 'background-color 0.2s'
                }}
              >
                {carData.image && !imageError ? (
                  <Box 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 1, 
                      overflow: 'hidden', 
                      flexShrink: 0 
                    }}
                  >
                    <img 
                      src={carData.image} 
                      alt={carData.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImageError(true)}
                    />
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.light', 
                      borderRadius: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  </Box>
                )}
                <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                  {carData.title}
                </Typography>
                <ExternalLinkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              </Box>
            </Box>
          )}
          
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: 12 }} />
              {formatDateTime(event.start_time)}
              {event.end_time && (
                <>
                  {' - '}
                  {formatTime(event.end_time)}
                </>
              )}
            </Typography>
            {event.location && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 12 }} />
                {event.location}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            {event.title}
          </Typography>
          
          {event.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              icon={<TimeIcon />} 
              label={`${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ''}`}
              size="small"
              variant="outlined"
            />
            {event.location && (
              <Chip 
                icon={<LocationIcon />} 
                label={event.location}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          {showCarInfo && carData && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Related Vehicle</Typography>
              <Box 
                onClick={handleCarClick}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'white' },
                  p: 1,
                  borderRadius: 1,
                  transition: 'background-color 0.2s'
                }}
              >
                {carData.image && !imageError ? (
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 1, 
                      overflow: 'hidden', 
                      flexShrink: 0 
                    }}
                  >
                    <img 
                      src={carData.image} 
                      alt={carData.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImageError(true)}
                    />
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'primary.light', 
                      borderRadius: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CarIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={500}>
                    {carData.title}
                  </Typography>
                </Box>
                <ExternalLinkIcon sx={{ color: 'text.secondary' }} />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        {event.title}
      </Typography>
      
      {event.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {event.description}
        </Typography>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 14 }} />
          {formatTime(event.start_time)}
          {event.end_time && (
            <>
              {' - '}
              {formatTime(event.end_time)}
            </>
          )}
        </Typography>
        {event.location && (
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon sx={{ fontSize: 14 }} />
            {event.location}
          </Typography>
        )}
      </Stack>

      {showCarInfo && carData && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box 
            onClick={handleCarClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
              '&:hover': { bgcolor: 'white' },
              p: 0.5,
              borderRadius: 1,
              transition: 'background-color 0.2s'
            }}
          >
            {carData.image && !imageError ? (
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 1, 
                  overflow: 'hidden', 
                  flexShrink: 0 
                }}
              >
                <img 
                  src={carData.image} 
                  alt={carData.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImageError(true)}
                />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              </Box>
            )}
            <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
              {carData.title}
            </Typography>
            <ExternalLinkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
