const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const TAX_BRACKETS = [
  { min: 0,        max: 237100,   base: 0,      rate: 0.18 },
  { min: 237101,   max: 370500,   base: 42678,  rate: 0.26 },
  { min: 370501,   max: 512800,   base: 77362,  rate: 0.31 },
  { min: 512801,   max: 673000,   base: 121475, rate: 0.36 },
  { min: 673001,   max: 857900,   base: 179147, rate: 0.39 },
  { min: 857901,   max: 1817000,  base: 251258, rate: 0.41 },
  { min: 1817001,  max: Infinity, base: 644489, rate: 0.45 },
];

const PRIMARY_REBATE   = 17235;
const SECONDARY_REBATE = 9444;
const TERTIARY_REBATE  = 3145;

function calculateTax(income, age) {
  const bracket = TAX_BRACKETS.find(b => income >= b.min && income <= b.max);
  if (!bracket) return 0;

  let tax = bracket.base + (income - bracket.min + 1) * bracket.rate;

  tax -= PRIMARY_REBATE;
  if (age >= 65) tax -= SECONDARY_REBATE;
  if (age >= 75) tax -= TERTIARY_REBATE;

  return Math.max(0, tax);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { name, annual_income, age } = req.body;

    if (!annual_income || annual_income <= 0) {
      return res.status(400).json({ error: 'Valid annual income is required' });
    }

    const parsedAge    = parseInt(age) || 30;
    const parsedIncome = parseFloat(annual_income);

    const tax            = calculateTax(parsedIncome, parsedAge);
    const effectiveRate  = ((tax / parsedIncome) * 100).toFixed(2);
    const takeHome       = parsedIncome - tax;
    const monthlyTakeHome = (takeHome / 12).toFixed(2);
    const monthlyTax     = (tax / 12).toFixed(2);
    const bracket        = TAX_BRACKETS.find(b => parsedIncome >= b.min && parsedIncome <= b.max);

    const record = {
      name:          name || 'Anonymous',
      annual_income: parsedIncome,
      age:           parsedAge,
      tax_liability: parseFloat(tax.toFixed(2)),
      effective_rate: parseFloat(effectiveRate),
      take_home:     parseFloat(takeHome.toFixed(2)),
      marginal_rate: bracket ? bracket.rate * 100 : 0,
    };

    const { data, error } = await supabase
      .from('calculations')
      .insert([record])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
      ...data[0],
      monthly_take_home: parseFloat(monthlyTakeHome),
      monthly_tax:       parseFloat(monthlyTax),
    });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID required' });

    const { error } = await supabase
      .from('calculations')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};