import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type ChartProps = {
  pointagesParChantier: { label: string; value: number }[];
  congesParStatut: { label: string; value: number; color: string }[];
};

export default function StatChart({ pointagesParChantier, congesParStatut }: ChartProps) {
  return (
    <div className="mt-8 grid w-full items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
      <section className="h-[24rem] rounded-bloc border border-slate-200 bg-white p-5 shadow-xl md:h-[28rem] md:p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900 md:text-xl">Pointages par chantier</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={pointagesParChantier} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '12px',
              }}
              itemStyle={{ color: '#0f172a' }}
              labelStyle={{ color: '#475569' }}
            />
            <Bar dataKey="value" name="Pointages" barSize={48} radius={[6, 6, 0, 0]} fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="h-[24rem] rounded-bloc border border-slate-200 bg-white p-5 shadow-xl md:h-[28rem] md:p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900 md:text-xl">Congés par statut</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={congesParStatut} dataKey="value" nameKey="label" outerRadius="62%">
              {congesParStatut.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
