# Design System - CityHub Civic Engagement Platform

## Colors

```yaml
colors:
  primary: '#1565c0'
  primary-light: '#1976d2'
  primary-dark: '#0d47a1'
  secondary: '#7b1fa2'
  secondary-light: '#9c27b0'
  secondary-dark: '#6a1b9a'
  background-default: '#f8fafc'
  background-paper: '#ffffff'
  text-primary: '#1a1a1a'
  text-secondary: '#666666'
  success: '#2e7d32'
  warning: '#ed6c02'
  error: '#d32f2f'
```

## Typography

```yaml
typography:
  font-family: 'Inter, Roboto, Helvetica, Arial, sans-serif'
  scale:
    h1:
      weight: 700
      size: 2.5rem
    h2:
      weight: 600
      size: 2rem
    h3:
      weight: 600
      size: 1.75rem
    h4:
      weight: 600
      size: 1.5rem
    h5:
      weight: 500
      size: 1.25rem
    h6:
      weight: 500
      size: 1rem
    body1:
      weight: 400
      size: 1rem
    body2:
      weight: 400
      size: 0.875rem
    caption:
      weight: 400
      size: 0.75rem
```

## Spacing

```yaml
spacing:
  unit: 8px
  scale:
    xs: 4px
    sm: 8px
    md: 16px
    lg: 24px
    xl: 32px
    xxl: 48px
```

## Components

### Button

```yaml
button:
  border-radius: 8px
  font-weight: 600
  padding: '8px 20px'
  contained-shadow: '0 2px 8px rgba(21, 101, 192, 0.2)'
  hover-shadow: '0 4px 12px rgba(21, 101, 192, 0.3)'
```

### Card

```yaml
card:
  border-radius: 16px
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  backdrop-filter: blur(10px)
```

### Input

```yaml
textfield:
  border-radius: 8px
```

## Effects

```yaml
glass:
  background: 'rgba(255, 255, 255, 0.7)'
  border: 'rgba(255, 255, 255, 0.3)'
  blur: 12px

glass-card:
  gradient: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'
  blur: 16px
  border-radius: 16px
  shadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
```

## Breakpoints

```yaml
breakpoints:
  xs: 0px
  sm: 600px
  md: 900px
  lg: 1200px
  xl: 1536px
```