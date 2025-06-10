
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
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WidgetConfig {
  timezone: string;
  hourFormat: '12h' | '24h';
  showSeconds: boolean;
  textColor: string;
  backgroundColor: string;
}

export default function WidgetGeneratorWidget() {
  const { toast } = useToast();
  const allTimezones = useMemo(() => getTimezones(), []);
  const [config, setConfig] = useState<WidgetConfig>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    hourFormat: '12h',
    showSeconds: true,
    textColor: '#FFFFFF',
    backgroundColor: '#29ABE2', // Primary color
  });
  const [embedCode, setEmbedCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const generateEmbedCode = useCallback((currentConfig: WidgetConfig): string => {
    const widgetId = `uclock-ai-widget-${Date.now()}`; // Unique ID for multiple widgets on a page
    const jsHourFormat = currentConfig.hourFormat === '12h' ? 'true' : 'false';
    
    return `
<div id="${widgetId}-container" style="background-color: ${currentConfig.backgroundColor}; color: ${currentConfig.textColor}; padding: 15px; border-radius: 8px; text-align: center; font-family: Arial, sans-serif; display: inline-block; min-width: 150px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <span id="${widgetId}-time" style="font-size: 1.5em; font-weight: bold;"></span>
</div>
<script>
  (function() {
    const timeElement = document.getElementById('${widgetId}-time');
    if (!timeElement) {
      console.error("Uclock Ai Widget: Time element not found.");
      return;
    }
    const timezone = "${currentConfig.timezone}";
    const use12HourFormat = ${jsHourFormat};
    const showSeconds = ${currentConfig.showSeconds};

    function updateTime() {
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
    // Ensure the interval is only set once per widget instance
    if (!window.uclockAiWidgetIntervals) {
      window.uclockAiWidgetIntervals = {};
    }
    if (window.uclockAiWidgetIntervals['${widgetId}']) {
      clearInterval(window.uclockAiWidgetIntervals['${widgetId}']);
    }
    window.uclockAiWidgetIntervals['${widgetId}'] = setInterval(updateTime, 1000);
    updateTime(); // Initial call
  })();
</script>
    `.trim();
  }, []);

  useEffect(() => {
    const code = generateEmbedCode(config);
    setEmbedCode(code);
    setPreviewHtml(code); // Use the same code for preview
  }, [config, generateEmbedCode]);

  const handleConfigChange = (field: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
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
        <CardContent className="space-y-4">
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
              <Label htmlFor="hourFormat">Hour Format</Label>
              <Select value={config.hourFormat} onValueChange={(value) => handleConfigChange('hourFormat', value as '12h' | '24h')}>
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
          <div className="p-4 border rounded-md bg-muted flex items-center justify-center min-h-[100px]">
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                title="Widget Preview"
                sandbox="allow-scripts" /* Important for security and isolation */
                className="w-auto h-auto border-0"
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
            rows={12}
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
