
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
import { Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatISO, addDays, set } from 'date-fns';

interface WidgetConfig {
  clockType: 'digital' | 'sleek';
  timezone: string;
  hourFormat: '12h' | '24h';
  showSeconds: boolean;
  textColor: string;
  backgroundColor: string;
  fontFamily: WidgetConfigFontFamily; // Changed to its own type
}

// Define a specific type for fontFamily to ensure type safety
type WidgetConfigFontFamily = 'Inter' | 'Roboto Mono' | 'Segment7';


const colorThemes = [
  { name: 'Default Blue', textColor: '#FFFFFF', backgroundColor: '#29ABE2' },
  { name: 'Dark Mode', textColor: '#E5E7EB', backgroundColor: '#1F2937' },
  { name: 'Light Mode', textColor: '#1F2937', backgroundColor: '#F3F4F6' },
  { name: 'Forest Green', textColor: '#FFFFFF', backgroundColor: '#228B22' },
  { name: 'Sunset Orange', textColor: '#FFFFFF', backgroundColor: '#FF8C00' },
  { name: 'Charcoal & Yellow', textColor: '#FDE047', backgroundColor: '#333333' },
  { name: 'Mint & White', textColor: '#333333', backgroundColor: '#A7F3D0' },
];

const fontFamilies: { value: WidgetConfigFontFamily; label: string }[] = [
  { value: 'Inter', label: 'Inter (Sans-Serif)' },
  { value: 'Roboto Mono', label: 'Roboto Mono (Monospace)' },
  { value: 'Segment7', label: 'Segment7 (Digital)' },
];

const getFontFamilyCss = (fontFamily: WidgetConfigFontFamily): string => {
  switch (fontFamily) {
    case 'Inter':
      return "'Inter', Arial, sans-serif";
    case 'Roboto Mono':
      return "'Roboto Mono', monospace";
    case 'Segment7':
      // Prioritize Segment7, fallback to Roboto Mono, then generic monospace
      return "'Segment7', 'Roboto Mono', monospace";
    default:
      return "Arial, sans-serif"; // Should not happen with typed fontFamily
  }
};


export default function WidgetGeneratorWidget() {
  const { toast } = useToast();
  const allTimezones = useMemo(() => getTimezones(), []);
  
  const defaultTheme = colorThemes.find(theme => theme.name === 'Charcoal & Yellow') || colorThemes[0];
  const [selectedThemeName, setSelectedThemeName] = useState<string>(defaultTheme.name);

  const [config, setConfig] = useState<WidgetConfig>({
    clockType: 'digital',
    timezone: '', // Initialized by useEffect client-side
    hourFormat: '12h',
    showSeconds: true,
    textColor: defaultTheme.textColor,
    backgroundColor: defaultTheme.backgroundColor,
    fontFamily: 'Segment7', // Default for digital clock
  });
  const [embedCode, setEmbedCode] = useState('');
  const [previewLoading, setPreviewLoading] = useState(true);

  // Client-side initialization for timezone
  useEffect(() => {
    // console.log("[WidgetGenerator] Initializing timezone client-side.");
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    setConfig(prev => ({
      ...prev,
      timezone: userTimezone,
    }));
    setPreviewLoading(false); // Allow preview generation after timezone is set
  }, []);


  const generateEmbedCode = useCallback((currentConfig: WidgetConfig): string => {
    if (!currentConfig.timezone) { // Guard against missing timezone during initial render
      return "<p>Initializing settings...</p>";
    }
    const widgetId = `uclock-ai-widget-${Date.now()}`;
    const jsHourFormat = currentConfig.hourFormat === '12h' ? 'true' : 'false';
    const selectedFontFamilyCss = getFontFamilyCss(currentConfig.fontFamily);

    let clockHtml = '';
    let clockScript = '';
    let mainContainerStyle = `background-color: ${currentConfig.backgroundColor}; color: ${currentConfig.textColor}; padding: 15px; border-radius: 8px; text-align: center; font-family: ${selectedFontFamilyCss}; display: inline-block; min-width: 150px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`;

    if (currentConfig.clockType === 'digital') {
      const digitalTimeFontFamily = currentConfig.fontFamily === 'Segment7' ? getFontFamilyCss('Segment7') : selectedFontFamilyCss;
      mainContainerStyle = `background-color: ${currentConfig.backgroundColor}; color: ${currentConfig.textColor}; padding: 15px; border-radius: 8px; text-align: center; font-family: ${selectedFontFamilyCss}; display: inline-block; min-width: 150px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`;
      clockHtml = `<span id="${widgetId}-time" style="font-size: 1.5em; font-weight: bold; font-family: ${digitalTimeFontFamily};"></span>`;
      clockScript = `
        const timeElement = document.getElementById('${widgetId}-time');
        if (!timeElement) { console.error("Uclock Ai Widget: Time element not found."); return; }
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
        updateDigitalTime();
        return updateDigitalTime;
      `;
    } else if (currentConfig.clockType === 'sleek') {
      mainContainerStyle = `background-color: ${currentConfig.backgroundColor}; color: ${currentConfig.textColor}; padding: 20px; border-radius: 10px; text-align: center; font-family: ${selectedFontFamilyCss}; display: inline-block; min-width: 220px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);`;
      clockHtml = `
        <div id="${widgetId}-time-container" style="margin-bottom: 10px;">
          <span id="${widgetId}-time" style="font-size: 2.8em; font-weight: bold; line-height: 1.1; display: inline;"></span>
          <span id="${widgetId}-ampm" style="font-size: 1.2em; opacity: 0.8; margin-left: 5px; display: ${currentConfig.hourFormat === '12h' ? 'inline' : 'none'};"></span>
        </div>
        <div id="${widgetId}-date" style="font-size: 0.95em; opacity: 0.9;"></div>
      `;
      clockScript = `
        const timeElement = document.getElementById('${widgetId}-time');
        const ampmElement = document.getElementById('${widgetId}-ampm');
        const dateElement = document.getElementById('${widgetId}-date');
        if (!timeElement || !ampmElement || !dateElement) { console.error("Uclock Ai Widget (Sleek): Core elements not found."); return; }

        const timezone = "${currentConfig.timezone}";
        const use12HourFormat = ${jsHourFormat};
        const showSeconds = ${currentConfig.showSeconds};
        
        function updateSleekTime() {
          const now = new Date();
          try {
            const timeOptions = {
              timeZone: timezone,
              hour12: use12HourFormat,
              hour: '2-digit',
              minute: '2-digit',
              ...(showSeconds && { second: '2-digit' })
            };
            let formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
            
            if (use12HourFormat) {
              const match = formattedTime.match(/(\\S+)\\s?(AM|PM)/i);
              if (match && match[1] && match[2]) {
                timeElement.textContent = match[1];
                ampmElement.textContent = match[2];
                ampmElement.style.display = 'inline';
              } else {
                // Fallback if regex fails or AM/PM is not part of the string (e.g. for locales that don't produce it)
                timeElement.textContent = formattedTime.replace(/\\s?(AM|PM)$/i, '').trim();
                const amPmMatch = formattedTime.match(/(AM|PM)$/i);
                if (amPmMatch && amPmMatch[1]) {
                   ampmElement.textContent = amPmMatch[1];
                   ampmElement.style.display = 'inline';
                } else {
                   ampmElement.style.display = 'none';
                }
              }
            } else {
              timeElement.textContent = formattedTime;
              ampmElement.style.display = 'none';
            }

            const dateOptions = {
              timeZone: timezone,
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            };
            dateElement.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
          } catch (e) {
            if (timeElement) timeElement.textContent = 'Error';
            if (dateElement) dateElement.textContent = 'Date Error';
            console.error("Uclock Ai Widget (Sleek): Error formatting time/date - ", e);
          }
        }
        updateSleekTime();
        return updateSleekTime;
      `;
    }
    
    return `
<div id="${widgetId}-container" style="${mainContainerStyle}">
  ${clockHtml}
</div>
<script>
  (function() {
    const widgetContainer = document.getElementById('${widgetId}-container');
    if (!widgetContainer) {
      console.error("Uclock Ai Widget: Container element '${widgetId}-container' not found.");
      return;
    }
    
    const updateTimeFunction = (function() {
      ${clockScript}
    })();

    if (typeof updateTimeFunction !== 'function') {
       console.error("Uclock Ai Widget: Update function not properly defined for ${currentConfig.clockType} type.");
       // Display error inside the widget container if possible
       const errorDisplay = document.createElement('p');
       errorDisplay.style.color = 'red';
       errorDisplay.textContent = 'Widget Error: Update function failed.';
       while (widgetContainer.firstChild) {
            widgetContainer.removeChild(widgetContainer.firstChild);
       }
       widgetContainer.appendChild(errorDisplay);
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
  }, [config]); // Changed dependency from [] to [config]

  useEffect(() => {
    if (previewLoading || !config.timezone) { // Don't generate code until timezone is initialized
      setEmbedCode("<p>Initializing settings...</p>");
      return;
    }
    // console.log("[Generator Effect] Config changed, re-generating embed code. Current config:", JSON.stringify(config, null, 2));
    const code = generateEmbedCode(config);
    setEmbedCode(code);
    // console.log("[Generator Effect] New embed code generated.");
  }, [config, generateEmbedCode, previewLoading]);

  const handleConfigChange = (field: keyof WidgetConfig, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      if (field === 'clockType') {
        if (value === 'digital' && newConfig.fontFamily !== 'Segment7') {
          newConfig.fontFamily = 'Segment7';
        } else if (value === 'sleek' && newConfig.fontFamily === 'Segment7') {
          newConfig.fontFamily = 'Inter';
        }
      }
      // console.log('[setConfig updater] newConfig being returned:', JSON.stringify(newConfig));
      return newConfig;
    });
    if (field === 'textColor' || field === 'backgroundColor') {
      setSelectedThemeName("Custom"); 
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

  const iframeSrcDoc = useMemo(() => {
    if (previewLoading) {
      return `<html><body><p>Initializing settings...</p></body></html>`;
    }
    return `
      <html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @font-face {
              font-family: 'Segment7';
              src: url('https://cdn.jsdelivr.net/gh/thefoxy131/fonts@main/segment7/Segment7Standard.otf') format('opentype');
              font-weight: normal;
              font-style: normal;
            }
            body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100px; background-color: transparent; }
          </style>
        </head>
        <body>
          ${embedCode}
        </body>
      </html>
    `;
  }, [embedCode, previewLoading]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Time Widget</CardTitle>
          <CardDescription>Customize the appearance and behavior of your embeddable time widget.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clockType">Clock Type</Label>
              <Select 
                value={config.clockType} 
                onValueChange={(value) => handleConfigChange('clockType', value as 'digital' | 'sleek')}
              >
                <SelectTrigger id="clockType"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital Clock</SelectItem>
                  <SelectItem value="sleek">Sleek Clock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select 
                value={config.fontFamily} 
                onValueChange={(value) => handleConfigChange('fontFamily', value as WidgetConfigFontFamily)}
              >
                <SelectTrigger id="fontFamily"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fontFamilies.map(font => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value} 
                      disabled={(config.clockType === 'sleek' && font.value === 'Segment7')}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              {previewLoading ? (
                 <div className="flex items-center justify-center h-10 border rounded-md bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                 </div>
              ) : (
                <Select 
                    value={config.timezone} 
                    onValueChange={(value) => handleConfigChange('timezone', value)}
                    disabled={!allTimezones.length}
                >
                    <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                    {allTimezones.map((tz: TimezoneOption) => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="hourFormat">Hour Format</Label>
              <Select 
                value={config.hourFormat} 
                onValueChange={(value) => handleConfigChange('hourFormat', value as '12h' | '24h')}
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
                <SelectItem value="Custom" disabled={selectedThemeName !== "Custom" && !colorThemes.some(t=>t.name === "Custom")}>Custom Colors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="textColor">Text Color</Label>
              <Input 
                id="textColor" 
                type="color" 
                value={config.textColor} 
                onChange={(e) => handleConfigChange('textColor', e.target.value)} 
                className="h-10 p-1"
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
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
            {previewLoading ? (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
            ) : (
              <iframe
                key={JSON.stringify(config)} // Force re-render on config change
                srcDoc={iframeSrcDoc}
                title="Widget Preview"
                sandbox="allow-scripts" 
                className="w-auto h-auto border-0"
                style={{minWidth: '180px', minHeight: '80px'}}
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
            rows={config.clockType === 'sleek' ? 20 : 15}
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

