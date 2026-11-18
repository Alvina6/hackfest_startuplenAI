import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ScoreBreakdownItem } from '../../../shared/types';

function getBarColor(score: number): string {
  if (score >= 75) return '#14B8A6';
  if (score >= 55) return '#8B5CF6';
  return '#F59E0B';
}

export function ScoreBreakdownChart({ items }: { items: ScoreBreakdownItem[] }) {
  const chartData = items.map((item) => ({
    ...item,
    shortLabel: item.category.replace(' Clarity', '').replace(' Readiness', ''),
  }));

  return (
    <div className="space-y-5">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={140}
              tick={{ fill: '#CBD5E1', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F1F5F9',
                fontSize: '12px',
              }}
              formatter={(value: unknown, _name: unknown, props: { payload?: ScoreBreakdownItem }) => [
                `${value}/100 (Weight ${props?.payload?.weight ?? 0}%)`,
                'Heuristic Score',
              ]}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
        {items.map((item) => (
          <div key={item.category} className="py-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium text-slate-100">{item.category}</span>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {item.weight}% weight
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{item.reason}</p>
            </div>
            <div className="shrink-0 font-mono text-sm font-semibold text-slate-100 tabular-nums">
              {item.score}/100
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
