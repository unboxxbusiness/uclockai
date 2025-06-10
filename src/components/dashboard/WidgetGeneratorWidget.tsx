
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getTimezones, type TimezoneOption } from '@/lib/timezones';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WidgetConfig {
  timezone: string;
  hourFormat: '12h' | '24h';
  showSeconds: boolean;
  textColor: string;
  backgroundColor: string;
  clockType: 'digital' | 'analog';
}

const colorThemes = [
  { name: 'Default Blue', textColor: '#FFFFFF', backgroundColor: '#29ABE2' },
  { name: 'Dark Mode', textColor: '#E5E7EB', backgroundColor: '#1F2937' },
  { name: 'Light Mode', textColor: '#1F2937', backgroundColor: '#F3F4F6' },
  { name: 'Forest Green', textColor: '#FFFFFF', backgroundColor: '#228B22' },
  { name: 'Sunset Orange', textColor: '#FFFFFF', backgroundColor: '#FF8C00' },
  { name: 'Charcoal & Yellow', textColor: '#FDE047', backgroundColor: '#333333' },
  { name: 'Mint & White', textColor: '#333333', backgroundColor: '#A7F3D0' },
];


export default function WidgetGeneratorWidget() {
  const { toast } = useToast();
  const allTimezones = useMemo(() => getTimezones(), []);
  const [selectedThemeName, setSelectedThemeName] = useState<string>(colorThemes[0].name);

  const [config, setConfig] = useState<WidgetConfig>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    hourFormat: '12h',
    showSeconds: true,
    textColor: colorThemes[0].textColor,
    backgroundColor: colorThemes[0].backgroundColor,
    clockType: 'digital',
  });
  const [embedCode, setEmbedCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const generateEmbedCode = useCallback((currentConfig: WidgetConfig): string => {
    const widgetId = `uclock-ai-widget-${Date.now()}`;
    const jsHourFormat = currentConfig.hourFormat === '12h' ? 'true' : 'false';

    let clockHtml = '';
    let clockScript = '';

    if (currentConfig.clockType === 'digital') {
      clockHtml = `<span id="${widgetId}-time" style="font-size: 1.5em; font-weight: bold;"></span>`;
      clockScript = `
        const timeElement = document.getElementById('${widgetId}-time');
        if (!timeElement) {
          console.error("Uclock Ai Widget: Time element not found.");
          return;
        }
        const timezone = "${currentConfig.timezone}";
        const use12HourFormat = ${jsHourFormat};
        const showSeconds = ${currentConfig.showSeconds};

        function updateDigitalTime() {
          const now = new Date();
          const options = {
            timeZone: timezone,
            hour12: use12HourFormat,
            hour: '2-digit',
            minute: '2-digit',
            ...(showSeconds && { second: '2-digit' })
          };
          try {
            timeElement.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
          } catch (e) {
            timeElement.textContent = 'Error';
            console.error("Uclock Ai Widget: Error formatting time - ", e);
          }
        }
        updateDigitalTime(); // Initial call
        return updateDigitalTime;
      `;
    } else { // Analog clock
      const analogClockSize = 100; // viewBox size, can be scaled by container
      clockHtml = `
        <svg id="${widgetId}-svg" width="100%" height="100%" viewBox="0 0 ${analogClockSize} ${analogClockSize}" style="display: block; margin: auto; max-width: 150px; max-height: 150px;">
          <circle cx="${analogClockSize / 2}" cy="${analogClockSize / 2}" r="${analogClockSize * 0.48}" stroke="${currentConfig.textColor}" stroke-width="2" fill="${currentConfig.backgroundColor}" />
          
          // Tick marks
          ${Array.from({ length: 12 }).map((_, i) => `
            <line 
              x1="${analogClockSize / 2}" 
              y1="${analogClockSize * 0.05}" 
              x2="${analogClockSize / 2}" 
              y2="${analogClockSize * 0.10}" 
              stroke="${currentConfig.textColor}" 
              stroke-width="${i % 3 === 0 ? 2 : 1}" 
              transform="rotate(${i * 30} ${analogClockSize / 2} ${analogClockSize / 2})" 
            />
          `).join('')}
          
          <line id="${widgetId}-hour" x1="${analogClockSize / 2}" y1="${analogClockSize / 2}" x2="${analogClockSize / 2}" y2="${analogClockSize * 0.25}" stroke="${currentConfig.textColor}" stroke-width="4" stroke-linecap="round" style="transform-origin: ${analogClockSize / 2}px ${analogClockSize / 2}px;"/>
          <line id="${widgetId}-minute" x1="${analogClockSize / 2}" y1="${analogClockSize / 2}" x2="${analogClockSize / 2}" y2="${analogClockSize * 0.15}" stroke="${currentConfig.textColor}" stroke-width="3" stroke-linecap="round" style="transform-origin: ${analogClockSize / 2}px ${analogClockSize / 2}px;"/>
          ${currentConfig.showSeconds ? `<line id="${widgetId}-second" x1="${analogClockSize / 2}" y1="${analogClockSize / 2}" x2="${analogClockSize / 2}" y2="${analogClockSize * 0.10}" stroke="${currentConfig.textColor}" stroke-width="1.5" stroke-linecap="round" style="transform-origin: ${analogClockSize / 2}px ${analogClockSize / 2}px;"/>` : ''}
          <circle cx="${analogClockSize / 2}" cy="${analogClockSize / 2}" r="3" fill="${currentConfig.textColor}" />
        </svg>
      `;
      clockScript = `
        const hourHand = document.getElementById('${widgetId}-hour');
        const minuteHand = document.getElementById('${widgetId}-minute');
        const secondHand = ${currentConfig.showSeconds ? `document.getElementById('${widgetId}-second');` : 'null'};
        const timezone = "${currentConfig.timezone}";
        const showSeconds = ${currentConfig.showSeconds};

        function updateAnalogTime() {
          const now = new Date();
          const options = { timeZone: timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
          const formatter = new Intl.DateTimeFormat('en-US', options);
          const parts = formatter.formatToParts(now);
          let h = 0, m = 0, s = 0;
          parts.forEach(part => {
            if (part.type === 'hour') h = parseInt(part.value);
            if (part.type === 'minute') m = parseInt(part.value);
            if (part.type === 'second') s = parseInt(part.value);
          });

          const hourDeg = (h % 12 + m / 60) * 30;
          const minuteDeg = (m + s / 60) * 6;
          const secondDeg = s * 6;

          if (hourHand) hourHand.style.transform = \`rotate(\${hourDeg}deg)\`;
          if (minuteHand) minuteHand.style.transform = \`rotate(\${minuteDeg}deg)\`;
          if (secondHand && showSeconds) secondHand.style.transform = \`rotate(\${secondDeg}deg)\`;
        }
        updateAnalogTime(); // Initial call
        return updateAnalogTime;
      `;
    }
    
    return `
<div id="${widgetId}-container" style="background-color: ${currentConfig.backgroundColor}; color: ${currentConfig.textColor}; padding: 15px; border-radius: 8px; text-align: center; font-family: Arial, sans-serif; display: inline-block; min-width: 150px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  ${clockHtml}
</div>
<script>
  (function() {
    const widgetContainer = document.getElementById('${widgetId}-container');
    if (!widgetContainer) {
      console.error("Uclock Ai Widget: Container element not found.");
      return;
    }
    
    const updateTimeFunction = (function() {
      ${clockScript}
    })();

    if (typeof updateTimeFunction !== 'function') {
       console.error("Uclock Ai Widget: Update function not properly defined.");
       return;
    }

    if (!window.uclockAiWidgetIntervals) {
      window.uclockAiWidgetIntervals = {};
    }
    if (window.uclockAiWidgetIntervals['${widgetId}']) {
      clearInterval(window.uclockAiWidgetIntervals['${widgetId}']);
    }
    window.uclockAiWidgetIntervals['${widgetId}'] = setInterval(updateTimeFunction, 1000);
  })();
</script>
    `.trim();
  }, []);

  useEffect(() => {
    const code = generateEmbedCode(config);
    setEmbedCode(code);
    // Add a unique key to the iframe to force re-render on config change for preview
    const previewKey = `preview-${JSON.stringify(config)}`; 
    setPreviewHtml(`<div key="${previewKey}">${code}</div>`);
  }, [config, generateEmbedCode]);

  const handleConfigChange = (field: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (field === 'textColor' || field === 'backgroundColor') {
      setSelectedThemeName("Custom"); // If individual colors are changed, set theme to custom
    }
  };

  const handleThemeChange = (themeName: string) => {
    const theme = colorThemes.find(t => t.name === themeName);
    if (theme) {
      setConfig(prev => ({
        ...prev,
        textColor: theme.textColor,
        backgroundColor: theme.backgroundColor,
      }));
      setSelectedThemeName(themeName);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({ title: "Copied!", description: "Embed code copied to clipboard." });
      })
      .catch(err => {
        toast({ title: "Failed to copy", description: "Could not copy code to clipboard.", variant: "destructive" });
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Time Widget</CardTitle>
          <CardDescription>Customize the appearance and behavior of your embeddable time widget.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="clockType" className="mb-2 block">Clock Type</Label>
            <RadioGroup
              id="clockType"
              value={config.clockType}
              onValueChange={(value) => handleConfigChange('clockType', value as 'digital' | 'analog')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digital" id="digital" />
                <Label htmlFor="digital">Digital</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="analog" id="analog" />
                <Label htmlFor="analog">Analog</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={config.timezone} onValueChange={(value) => handleConfigChange('timezone', value)}>
                <SelectTrigger id="timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>
                  {allTimezones.map((tz: TimezoneOption) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hourFormat">Hour Format (Digital Only)</Label>
              <Select 
                value={config.hourFormat} 
                onValueChange={(value) => handleConfigChange('hourFormat', value as '12h' | '24h')}
                disabled={config.clockType === 'analog'}
              >
                <SelectTrigger id="hourFormat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showSeconds" 
              checked={config.showSeconds} 
              onCheckedChange={(checked) => handleConfigChange('showSeconds', !!checked)}
            />
            <Label htmlFor="showSeconds" className="cursor-pointer">Show seconds</Label>
          </div>
          
          <div>
            <Label htmlFor="colorTheme">Color Theme</Label>
            <Select value={selectedThemeName} onValueChange={handleThemeChange}>
              <SelectTrigger id="colorTheme"><SelectValue placeholder="Select a color theme" /></SelectTrigger>
              <SelectContent>
                {colorThemes.map((theme) => (
                  <SelectItem key={theme.name} value={theme.name}>{theme.name}</SelectItem>
                ))}
                <SelectItem value="Custom" disabled={!colorThemes.find(t=>t.name === "Custom")}>Custom Colors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="textColor">Text Color / Hands Color</Label>
              <Input 
                id="textColor" 
                type="color" 
                value={config.textColor} 
                onChange={(e) => handleConfigChange('textColor', e.target.value)} 
                className="h-10 p-1"
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Background Color / Face Color</Label>
              <Input 
                id="backgroundColor" 
                type="color" 
                value={config.backgroundColor} 
                onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                className="h-10 p-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Widget Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md bg-muted flex items-center justify-center min-h-[150px]">
            {previewHtml && (
              <iframe
                // By changing the key, we force React to re-mount the iframe, re-running its script
                key={JSON.stringify(config)} 
                srcDoc={`
                  <html>
                    <head>
                      <style>
                        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100px; }
                      </style>
                    </head>
                    <body>
                      ${embedCode}
                    </body>
                  </html>
                `}
                title="Widget Preview"
                sandbox="allow-scripts" 
                className="w-auto h-auto border-0"
                style={{minWidth: '180px', minHeight: '80px'}} // Ensure iframe itself has some size
                scrolling="no"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>Copy and paste this code into your website's HTML where you want the widget to appear.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={embedCode}
            readOnly
            rows={15}
            className="text-xs font-mono bg-muted/50"
            aria-label="Embeddable widget code"
          />
          <Button onClick={copyToClipboard} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

