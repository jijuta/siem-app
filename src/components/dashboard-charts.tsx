"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap
} from 'recharts'

// Muted professional color palette
const colors = {
  primary: '#3b82f6',      // Soft blue
  secondary: '#64748b',    // Slate gray
  accent: '#6366f1',       // Indigo
  success: '#10b981',      // Emerald
  warning: '#f59e0b',      // Amber
  danger: '#ef4444',       // Red
  muted: '#94a3b8',        // Light slate
  chart1: '#6366f1',       // Indigo
  chart2: '#8b5cf6',       // Violet
  chart3: '#3b82f6',       // Blue
  chart4: '#06b6d4',       // Cyan
  chart5: '#10b981'        // Emerald
}

// Mock data for charts
const timeSeriesData = [
  { time: '00:00', events: 120, alerts: 15, threats: 8 },
  { time: '04:00', events: 98, alerts: 8, threats: 3 },
  { time: '08:00', events: 186, alerts: 23, threats: 12 },
  { time: '12:00', events: 278, alerts: 42, threats: 18 },
  { time: '16:00', events: 341, alerts: 38, threats: 22 },
  { time: '20:00', events: 245, alerts: 31, threats: 15 },
  { time: '23:59', events: 189, alerts: 21, threats: 11 },
]

const severityData = [
  { name: 'Critical', value: 23, color: colors.danger },
  { name: 'High', value: 67, color: colors.warning },
  { name: 'Medium', value: 142, color: colors.accent },
  { name: 'Low', value: 298, color: colors.primary },
  { name: 'Info', value: 156, color: colors.secondary },
]

const vendorComparisonData = [
  { vendor: 'CrowdStrike', detections: 245, incidents: 32, resolved: 28 },
  { vendor: 'Cisco', detections: 189, incidents: 24, resolved: 21 },
  { vendor: 'Fortinet', detections: 312, incidents: 45, resolved: 38 },
  { vendor: 'Cortex', detections: 198, incidents: 29, resolved: 25 },
]

const threatData = [
  { type: 'Malware', count: 89 },
  { type: 'Phishing', count: 67 },
  { type: 'Ransomware', count: 34 },
  { type: 'DDoS', count: 23 },
  { type: 'Insider', count: 12 },
  { type: 'APT', count: 8 },
]

const radarData = [
  { metric: 'Detection Rate', value: 85, fullMark: 100 },
  { metric: 'Response Time', value: 72, fullMark: 100 },
  { metric: 'False Positives', value: 25, fullMark: 100 },
  { metric: 'Coverage', value: 93, fullMark: 100 },
  { metric: 'Automation', value: 68, fullMark: 100 },
  { metric: 'Accuracy', value: 88, fullMark: 100 },
]

// Additional data for new charts
const networkFlowData = [
  { source: 'External', target: 'DMZ', value: 2400 },
  { source: 'DMZ', target: 'Internal', value: 800 },
  { source: 'Internal', target: 'Cloud', value: 1200 },
  { source: 'Cloud', target: 'External', value: 600 },
]

const anomalyData = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 40 + 10,
  category: Math.random() > 0.7 ? 'anomaly' : 'normal'
}))

const mitreData = [
  { name: 'Initial Access', value: 45 },
  { name: 'Execution', value: 78 },
  { name: 'Persistence', value: 62 },
  { name: 'Privilege Escalation', value: 34 },
  { name: 'Defense Evasion', value: 89 },
  { name: 'Credential Access', value: 23 },
  { name: 'Discovery', value: 56 },
  { name: 'Lateral Movement', value: 41 },
  { name: 'Collection', value: 37 },
  { name: 'Command and Control', value: 52 },
  { name: 'Exfiltration', value: 18 },
  { name: 'Impact', value: 12 },
]

export function DashboardCharts() {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* 1. Event Timeline - Area Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Event Timeline</CardTitle>
          <CardDescription className="text-xs">24-hour activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.accent} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.warning} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.warning} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Area type="monotone" dataKey="events" stroke={colors.primary} fillOpacity={0.3} fill={colors.primary} />
              <Area type="monotone" dataKey="alerts" stroke={colors.accent} fillOpacity={0.3} fill={colors.accent} />
              <Area type="monotone" dataKey="threats" stroke={colors.warning} fillOpacity={0.3} fill={colors.warning} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Severity Distribution - Pie Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Severity Distribution</CardTitle>
          <CardDescription className="text-xs">Alert breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Security Metrics - Radar Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Security Metrics</CardTitle>
          <CardDescription className="text-xs">Overall posture</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={colors.muted} opacity={0.3} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} stroke="oklch(var(--muted-foreground))" />
              <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="oklch(var(--muted-foreground))" />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke={colors.primary} 
                fill={colors.primary} 
                fillOpacity={0.5} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Vendor Performance - Bar Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vendor Performance</CardTitle>
          <CardDescription className="text-xs">Comparative analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vendorComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis dataKey="vendor" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="detections" fill={colors.primary} />
              <Bar dataKey="incidents" fill={colors.accent} />
              <Bar dataKey="resolved" fill={colors.success} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5. Threat Categories - Horizontal Bar Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Threat Categories</CardTitle>
          <CardDescription className="text-xs">Distribution of detected threat types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={threatData} margin={{ bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="count" fill={colors.accent} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 6. Anomaly Detection - Scatter Plot */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Anomaly Detection</CardTitle>
          <CardDescription className="text-xs">ML-based detection</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis type="number" dataKey="x" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <YAxis type="number" dataKey="y" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Scatter 
                name="Normal" 
                data={anomalyData.filter(d => d.category === 'normal')} 
                fill={colors.secondary}
                fillOpacity={0.6}
              />
              <Scatter 
                name="Anomaly" 
                data={anomalyData.filter(d => d.category === 'anomaly')} 
                fill={colors.danger}
                fillOpacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 7. MITRE ATT&CK - Line Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">MITRE ATT&CK</CardTitle>
          <CardDescription className="text-xs">Tactics frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mitreData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={50} stroke="oklch(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.accent, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 8. Network Flow - Composed Chart */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Network Flow</CardTitle>
          <CardDescription className="text-xs">Traffic patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={[
              { name: 'Inbound', value: 4200, line: 85 },
              { name: 'Outbound', value: 3800, line: 72 },
              { name: 'Internal', value: 2400, line: 60 },
              { name: 'DMZ', value: 1800, line: 45 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="oklch(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar yAxisId="left" dataKey="value" fill={colors.primary} />
              <Line yAxisId="right" type="monotone" dataKey="line" stroke={colors.accent} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 9. Risk Matrix - Treemap */}
      <Card className="border-opacity-50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Matrix</CardTitle>
          <CardDescription className="text-xs">Asset risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <Treemap
              data={[
                { name: 'Critical Assets', size: 2400, fill: colors.danger },
                { name: 'High Value', size: 1800, fill: colors.warning },
                { name: 'Medium Risk', size: 1200, fill: colors.accent },
                { name: 'Low Priority', size: 800, fill: colors.primary },
                { name: 'Monitored', size: 600, fill: colors.success },
              ]}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="oklch(var(--background))"
            >
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(var(--background))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '6px'
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}