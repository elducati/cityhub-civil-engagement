import { SxProps, Theme } from '@mui/material';

export const glassStyle: SxProps<Theme> = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 3,
};

export const glassCardStyle: SxProps<Theme> = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: 4,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
};

export const gradientBackground: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #f0f4f8 100%)',
  minHeight: '100vh',
};