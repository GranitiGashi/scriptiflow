'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import EventCard from './EventCard';

interface CarData {
  id?: string;
  title: string;
  image?: string;
  url?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  car_mobile_de_id?: string;
  car?: CarData;
}

interface TodayEventsProps {
  events: Event[];
  cars?: CarData[];
  variant?: 'default' | 'compact' | 'detailed';
  showCarInfo?: boolean;
  title?: string;
}

export default function TodayEvents({ 
  events, 
  cars = [], 
  variant = 'compact',
  showCarInfo = true,
  title = "Today's Events"
}: TodayEventsProps) {
  if (!events || events.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No events today
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Stack spacing={2}>
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            cars={cars}
            variant={variant}
            showCarInfo={showCarInfo}
          />
        ))}
      </Stack>
    </Box>
  );
}
