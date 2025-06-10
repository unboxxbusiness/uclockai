
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Palette, Clock, Type, CheckSquare, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CountdownWidgetConfig {
  targetDateTime: string;
  title: string;
  themeName: string;
  titleColor: string;
  numberColor: string;
  labelColor: string;
  backgroundColor: string;
  borderColor?: string; 
  fontFamily: 'Inter' | 'Roboto Mono';
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  finishedText: string;
}

const countdownThemes = [
  { name: 'Midnight Glow', titleColor: '#E0E7FF', numberColor: '#C7D2FE', labelColor: '#A5B4FC', backgroundColor: '#1E1B4B' },
  { name: 'Festive Red', titleColor: '#FFFFFF', numberColor: '#FEF2F2', labelColor: '#FECACA', backgroundColor: '#B91C1C' },
  { name: 'Clean White', titleColor: '#1F2937', numberColor: '#374151', labelColor: '#6B7280', backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  { name: 'Minimal Dark', titleColor: '#E5E7EB', numberColor: '#D1D5DB', labelColor: '#9CA3AF', backgroundColor: '#111827' },
  { name: 'Forest Calm', titleColor: '#F0FFF4', numberColor: '#D1FAE5', labelColor: '#A7F3D0', backgroundColor: '#065F46' },
  { name: 'Sunset Orange', titleColor: '#FFFFFF', numberColor: '#FFF7ED', labelColor: '#FED7AA', backgroundColor: '#C2410C' },
];

const fontOptions = [
  { value: 'Inter', label: 'Inter (Sans-Serif)' },
  { value: 'Roboto Mono', label: 'Roboto Mono (Monospace)' },
];

export default function CountdownWidgetGeneratorWidget() {
  const { toast } = useToast();
  const defaultTheme = countdownThemes.find(theme => theme.name === 'Midnight Glow') || countdownThemes[0];
  
  const getDefaultTargetDateTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Midnight tomorrow
    return format(tomorrow, "yyyy-MM-dd'T'HH:mm");
  };

  const [config, setConfig] = useState<CountdownWidgetConfig>({
    targetDateTime: getDefaultTargetDateTime(),
    title: 'Countdown!',
    themeName: defaultTheme.name,
    titleColor: defaultTheme.titleColor,
    numberColor: defaultTheme.numberColor,
    labelColor: defaultTheme.labelColor,
    backgroundColor: defaultTheme.backgroundColor,
    borderColor: defaultTheme.borderColor,
    fontFamily: 'Inter',
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    finishedText: "Time's Up!",
  });
  const [embedCode, setEmbedCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const generateEmbedCode = useCallback((currentConfig: CountdownWidgetConfig): string => {
    const widgetId = `uclock-countdown-widget-${Date.now()}`;
    const { 
      targetDateTime, title, titleColor, numberColor, labelColor, backgroundColor, borderColor,
      fontFamily, showDays, showHours, showMinutes, showSeconds, finishedText 
    } = currentConfig;

    const containerStyle = `
      background-color: ${backgroundColor}; 
      color: ${numberColor}; 
      padding: 20px; 
      border-radius: 12px; 
      text-align: center; 
      font-family: '${fontFamily}', sans-serif; 
      display: inline-block; 
      min-width: 280px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ${borderColor ? `border: 1px solid ${borderColor};` : ''}
    `.trim().replace(/\s\s+/g, ' ');

    const titleStyle = `
      color: ${titleColor}; 
      font-size: 1.5em; 
      font-weight: bold; 
      margin-bottom: 15px;
    `.trim().replace(/\s\s+/g, ' ');

    const timeUnitContainerStyle = `
      display: flex; 
      justify-content: center; 
      gap: 10px;
    `.trim().replace(/\s\s+/g, ' ');
    
    const timeUnitStyle = `
      display: flex; 
      flex-direction: column; 
      align-items: center;
      padding: 5px;
      min-width: 50px;
    `.trim().replace(/\s\s+/g, ' ');

    const numberStyle = `
      font-size: 2.2em; 
      font-weight: bold; 
      line-height: 1.1;
      color: ${numberColor};
    `.trim().replace(/\s\s+/g, ' ');

    const labelStyle = `
      font-size: 0.75em; 
      text-transform: uppercase; 
      color: ${labelColor};
      margin-top: 3px;
    `.trim().replace(/\s\s+/g, ' ');
    
    const finishedMessageStyle = `
      font-size: 1.8em;
      font-weight: bold;
      color: ${titleColor};
    `.trim().replace(/\s\s+/g, ' ');

    let timeUnitsHtml = '';
    if (showDays) timeUnitsHtml += `<div style="${timeUnitStyle}"><span id="${widgetId}-days" style="${numberStyle}">0</span><span style="${labelStyle}">Days</span></div>`;
    if (showHours) timeUnitsHtml += `<div style="${timeUnitStyle}"><span id="${widgetId}-hours" style="${numberStyle}">0</span><span style="${labelStyle}">Hours</span></div>`;
    if (showMinutes) timeUnitsHtml += `<div style="${timeUnitStyle}"><span id="${widgetId}-minutes" style="${numberStyle}">0</span><span style="${labelStyle}">Minutes</span></div>`;
    if (showSeconds) timeUnitsHtml += `<div style="${timeUnitStyle}"><span id="${widgetId}-seconds" style="${numberStyle}">0</span><span style="${labelStyle}">Seconds</span></div>`;

    return `
<div id="${widgetId}-container" style="${containerStyle}">
  ${title ? `<div style="${titleStyle}">${title}</div>` : ''}
  <div id="${widgetId}-timer" style="${timeUnitContainerStyle}">${timeUnitsHtml}</div>
  <div id="${widgetId}-finished" style="display:none; ${finishedMessageStyle}">${finishedText}</div>
</div>
<script>
  (function() {
    const targetDateStr = "${targetDateTime}";
    if (!targetDateStr) {
      console.error("Uclock Countdown Widget: Target date/time not set.");
      const container = document.getElementById('${widgetId}-container');
      if (container) container.innerHTML = "<p style='color:red; font-family: sans-serif;'>Error: Target date not set.</p>";
      return;
    }
    const targetDate = new Date(targetDateStr).getTime();
    if (isNaN(targetDate)) {
      console.error("Uclock Countdown Widget: Invalid target date/time format - " + targetDateStr);
      const container = document.getElementById('${widgetId}-container');
      if (container) container.innerHTML = "<p style='color:red; font-family: sans-serif;'>Error: Invalid date format.</p>";
      return;
    }
    
    const timerDiv = document.getElementById('${widgetId}-timer');
    const finishedDiv = document.getElementById('${widgetId}-finished');
    
    const daysEl = document.getElementById('${widgetId}-days');
    const hoursEl = document.getElementById('${widgetId}-hours');
    const minutesEl = document.getElementById('${widgetId}-minutes');
    const secondsEl = document.getElementById('${widgetId}-seconds');

    let missingElements = [];
    if (!timerDiv) missingElements.push('timer (internal)');
    if (!finishedDiv) missingElements.push('finished message area (internal)');
    if (${showDays} && !daysEl) missingElements.push('days display');
    if (${showHours} && !hoursEl) missingElements.push('hours display');
    if (${showMinutes} && !minutesEl) missingElements.push('minutes display');
    if (${showSeconds} && !secondsEl) missingElements.push('seconds display');

    if (missingElements.length > 0) {
      console.error("Uclock Countdown Widget: Could not find all required elements. Missing: " + missingElements.join(', '));
      const errorContainer = document.getElementById('${widgetId}-container');
      if (errorContainer) {
          errorContainer.innerHTML = "<p style='color:red; font-family: sans-serif; font-size: small;'>Widget Error: Could not initialize all parts. Missing: " + missingElements.join(', ') + ".</p>";
      }
      return;
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        timerDiv.style.display = 'none';
        finishedDiv.style.display = 'block';
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      if (${showDays} && daysEl) daysEl.textContent = d;
      if (${showHours} && hoursEl) hoursEl.textContent = h;
      if (${showMinutes} && minutesEl) minutesEl.textContent = m;
      if (${showSeconds} && secondsEl) secondsEl.textContent = s;
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call
  })();
</script>
    `.trim().replace(/\n\s*/g, ''); // Minify slightly for embed code
  }, []);

  useEffect(() => {
    const code = generateEmbedCode(config);
    setEmbedCode(code);
    setPreviewHtml(code); 
  }, [config, generateEmbedCode]);

  const handleConfigChange = (field: keyof CountdownWidgetConfig, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      if (field === 'themeName') {
        const theme = countdownThemes.find(t => t.name === value);
        if (theme) {
          return {
            ...newConfig,
            titleColor: theme.titleColor,
            numberColor: theme.numberColor,
            labelColor: theme.labelColor,
            backgroundColor: theme.backgroundColor,
            borderColor: theme.borderColor,
          };
        }
      }
      return newConfig;
    });
  };
  
  const handleColorChange = (field: keyof CountdownWidgetConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
      themeName: "Custom" // Indicate that colors are custom
    }));
  };


  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({ title: "Copied!", description: "Embed code copied to clipboard." });
      })
      .catch(err => {
        toast({ title: "Failed to copy", description: "Could not copy code to clipboard.", variant: "destructive" });
      });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5" />Set Target & Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="targetDateTime">Target Date & Time</Label>
            <Input 
              id="targetDateTime" 
              type="datetime-local" 
              value={config.targetDateTime} 
              onChange={(e) => handleConfigChange('targetDateTime', e.target.value)} 
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input 
              id="title" 
              type="text" 
              placeholder="e.g., New Year 2025" 
              value={config.title} 
              onChange={(e) => handleConfigChange('title', e.target.value)}
              className="mt-1"
            />
          </div>
           <div>
            <Label htmlFor="finishedText">Text after countdown finishes</Label>
            <Input 
              id="finishedText" 
              type="text" 
              value={config.finishedText} 
              onChange={(e) => handleConfigChange('finishedText', e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5" />Style Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="themeName">Color Theme</Label>
            <Select value={config.themeName} onValueChange={(value) => handleConfigChange('themeName', value)}>
              <SelectTrigger id="themeName" className="mt-1"><SelectValue placeholder="Select a theme" /></SelectTrigger>
              <SelectContent>
                {countdownThemes.map((theme) => (
                  <SelectItem key={theme.name} value={theme.name}>{theme.name}</SelectItem>
                ))}
                <SelectItem value="Custom" disabled={config.themeName !== "Custom" && !countdownThemes.some(t=>t.name === "Custom")}>Custom Colors</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="titleColor">Title Color</Label>
              <Input id="titleColor" type="color" value={config.titleColor} onChange={(e) => handleColorChange('titleColor', e.target.value)} className="h-10 p-1 mt-1 w-full"/>
            </div>
            <div>
              <Label htmlFor="numberColor">Number Color</Label>
              <Input id="numberColor" type="color" value={config.numberColor} onChange={(e) => handleColorChange('numberColor', e.target.value)} className="h-10 p-1 mt-1 w-full"/>
            </div>
            <div>
              <Label htmlFor="labelColor">Label Color</Label>
              <Input id="labelColor" type="color" value={config.labelColor} onChange={(e) => handleColorChange('labelColor', e.target.value)} className="h-10 p-1 mt-1 w-full"/>
            </div>
            <div>
              <Label htmlFor="backgroundColor">Background</Label>
              <Input id="backgroundColor" type="color" value={config.backgroundColor} onChange={(e) => handleColorChange('backgroundColor', e.target.value)} className="h-10 p-1 mt-1 w-full"/>
            </div>
            <div>
              <Label htmlFor="borderColor">Border (Optional)</Label>
              <Input id="borderColor" type="color" value={config.borderColor || '#000000'} onChange={(e) => handleColorChange('borderColor', e.target.value)} className="h-10 p-1 mt-1 w-full"/>
              <Button size="sm" variant="link" className="p-0 h-auto text-xs" onClick={() => handleColorChange('borderColor', '')}>Clear Border</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select value={config.fontFamily} onValueChange={(value) => handleConfigChange('fontFamily', value as 'Inter' | 'Roboto Mono')}>
              <SelectTrigger id="fontFamily" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fontOptions.map(font => <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CheckSquare className="mr-2 h-5 w-5" />Display Units</CardTitle>
          <CardDescription>Choose which time units to display in the countdown.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {id: 'showDays', label: 'Days'}, 
            {id: 'showHours', label: 'Hours'},
            {id: 'showMinutes', label: 'Minutes'},
            {id: 'showSeconds', label: 'Seconds'}
          ].map(unit => (
            <div key={unit.id} className="flex items-center space-x-2">
              <Checkbox 
                id={unit.id} 
                checked={config[unit.id as keyof CountdownWidgetConfig] as boolean} 
                onCheckedChange={(checked) => handleConfigChange(unit.id as keyof CountdownWidgetConfig, !!checked)}
              />
              <Label htmlFor={unit.id} className="cursor-pointer">{unit.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5" />Widget Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md bg-muted flex items-center justify-center min-h-[150px]">
            {previewHtml && (
              <iframe
                key={JSON.stringify(config)} 
                srcDoc={`
                  <html>
                    <head>
                      <link rel="preconnect" href="https://fonts.googleapis.com">
                      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
                      <style> body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100px; } </style>
                    </head>
                    <body>
                      ${previewHtml}
                    </body>
                  </html>
                `}
                title="Countdown Widget Preview"
                sandbox="allow-scripts" 
                className="w-auto h-auto border-0"
                style={{minWidth: '320px', minHeight: '120px'}} // Adjusted for better preview
                scrolling="no"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Code className="mr-2 h-5 w-5" />Embed Code</CardTitle>
          <CardDescription>Copy and paste this code into your website's HTML.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={embedCode}
            readOnly
            rows={12}
            className="text-xs font-mono bg-muted/50"
            aria-label="Embeddable countdown widget code"
          />
          <Button onClick={copyToClipboard} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

